const express = require('express');
const { connectProducer, publishEvent, createConsumer } = require('../shared/kafka');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.post('/api/orders', async (req, res) => {
  const { items, address } = req.body;
  const customer_id = req.headers['x-user-id']; // Injected by API Gateway
  
  if (!customer_id || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Calculate total amount and validate items
    let amount_total = 0;
    const validatedItems = [];
    let requires_prescription = false;
    
    for (const item of items) {
       const dbItem = await prisma.catalog_items.findUnique({
         where: { id: item.id },
         select: { price: true, requires_prescription: true }
       });
       
       if (!dbItem) {
          return res.status(400).json({ error: `Item with id ${item.id} not found` });
       }
       if (dbItem.requires_prescription) {
           requires_prescription = true;
       }
       const unit_price = Number(dbItem.price);
       amount_total += unit_price * item.quantity;
       validatedItems.push({ ...item, unit_price });
    }
    const prescription_status = requires_prescription ? 'pending' : 'n_a';

    // 2. Persist Order and Items via Prisma Transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.orders.create({
        data: {
          customer_id,
          order_type: 'service',
          address: address,
          amount_total,
          status: 'pending_payment',
          prescription_status,
          order_items: {
            create: validatedItems.map(item => ({
              catalog_item_id: item.id,
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          }
        },
        include: {
          order_items: true
        }
      });
      return createdOrder;
    });

    // 4. Publish Event to Kafka
    await publishEvent('orders', 'order.placed', {
      order_id: order.id,
      customer_id,
      amount_total,
      timestamp: order.created_at
    });

    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/orders', async (req, res) => {
  const user_id = req.headers['x-user-id'];
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const providerProfile = await prisma.provider_profiles.findUnique({
      where: { user_id }
    });
    
    if (providerProfile) {
       // Return worker's assigned orders
       const assignedOrders = await prisma.orders.findMany({
         where: {
           provider_assignments: {
             some: { provider_id: providerProfile.id }
           }
         }
       });
       return res.json({ orders: assignedOrders });
    }

    // Customer's orders
    const orders = await prisma.orders.findMany({
      where: { customer_id: user_id }
    });
    res.json({ orders });
  } catch(err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.orders.update({
        where: { id },
        data: { 
          status, 
          updated_at: new Date(),
          order_status_history: {
            create: { status }
          }
        }
      });
      return order;
    });
    
    if (status === 'completed') {
        await publishEvent('orders', 'order.completed', {
          order_id: id,
          customer_id: updatedOrder.customer_id,
          amount_total: Number(updatedOrder.amount_total)
        });
    }
    
    res.json({ message: 'Order status updated' });
  } catch(err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const user_id = req.headers['x-user-id'];
  
  try {
    const order = await prisma.orders.findUnique({ where: { id } });
    
    if (!order || order.customer_id !== user_id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (['completed', 'cancelled', 'refunded'].includes(order.status)) {
       return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id },
        data: { 
          status: 'cancelled',
          order_status_history: {
            create: { status: 'cancelled' }
          }
        }
      });
    });
    
    await publishEvent('payments', 'payment.refund.requested', {
      order_id: id,
      reason: 'Customer cancelled'
    });
    
    res.json({ message: 'Order cancelled, refund requested' });
  } catch(err) {
    console.error('Failed to cancel order:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

const startServer = async () => {
  try {
    await connectProducer();
    console.log('[Order Service] Connected to Kafka Producer');
    
    await createConsumer('order-service-saga-group', ['provider.assignments', 'payments'], async (eventType, payload) => {
      if (eventType === 'provider.assignment.failed') {
         const { order_id, reason } = payload;
         console.log(`[Order Service] Order ${order_id} dispatch failed (${reason}). Initiating Saga Rollback...`);
         
         try {
           await prisma.$transaction(async (tx) => {
             await tx.orders.update({
               where: { id: order_id },
               data: { 
                 status: 'cancelled',
                 order_status_history: {
                   create: { status: 'cancelled' }
                 }
               }
             });
           });
           
           console.log(`[Order Service] Order ${order_id} cancelled. Requesting refund...`);
           
           await publishEvent('payments', 'payment.refund.requested', {
             order_id,
             reason
           });
         } catch (err) {
           console.error('[Order Service] Rollback failure:', err);
         }
      } else if (eventType === 'payment.refunded') {
         const { order_id } = payload;
         console.log(`[Order Service] Refund processed for Order ${order_id}. Completing Rollback.`);
         
         try {
           await prisma.$transaction(async (tx) => {
             await tx.orders.update({
               where: { id: order_id },
               data: { 
                 status: 'refunded',
                 order_status_history: {
                   create: { status: 'refunded' }
                 }
               }
             });
           });
         } catch (err) {
           console.error('[Order Service] Failed to mark order refunded:', err);
         }
      }
    });

    app.listen(3001, () => {
      console.log('[Order Service] Listening on port 3001');
    });
  } catch (err) {
    console.error('Failed to start Order Service:', err);
  }
};

startServer();
