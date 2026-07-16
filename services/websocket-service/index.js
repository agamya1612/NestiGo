const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createConsumer } = require('../shared/kafka');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`[WebSocket Service] Client connected: ${socket.id}`);
  
  socket.on('subscribe_order', (orderId) => {
    console.log(`[WebSocket Service] Client ${socket.id} subscribed to order ${orderId}`);
    socket.join(`order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket Service] Client disconnected: ${socket.id}`);
  });
});

const startService = async () => {
  try {
    await createConsumer('websocket-group', ['orders', 'provider.assignments', 'payments'], async (eventType, payload) => {
      // Broadcast events to the specific order's room
      if (payload.order_id) {
        console.log(`[WebSocket Service] Broadcasting ${eventType} for order ${payload.order_id}`);
        io.to(`order_${payload.order_id}`).emit('order_update', { eventType, payload });
      }
    });

    server.listen(3005, () => {
      console.log('[WebSocket Service] Listening on port 3005');
    });
  } catch (error) {
    console.error('Failed to start WebSocket Service:', error);
  }
};

startService();
