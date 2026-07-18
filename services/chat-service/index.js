const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { pool } = require('../shared/db');
const { connectProducer, createConsumer } = require('../shared/kafka');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
     socket.join(userId); // Join personal room for incoming calls
  }

  socket.on('join_chat', (roomId) => {
     socket.join(roomId);
  });

  socket.on('send_message', async (data) => {
     const { room_id, sender_id, content } = data;
     
     // Save to DB
     const client = await pool.connect();
     try {
       const room = await client.query('SELECT active FROM chat_rooms WHERE id = $1', [room_id]);
       if (room.rows.length === 0 || !room.rows[0].active) {
          return socket.emit('error', 'Chat room is inactive or does not exist');
       }
       
       await client.query(`INSERT INTO messages (room_id, sender_id, content) VALUES ($1, $2, $3)`, [room_id, sender_id, content]);
       io.to(room_id).emit('new_message', data);
     } catch(err) {
       console.error('[Chat Service] Failed to send message', err);
     } finally {
       client.release();
     }
  });
});

const startServer = async () => {
  try {
    await connectProducer();
    console.log('[Chat Service] Connected to Kafka Producer');
    
    await createConsumer('chat-service-group', ['provider.assignments', 'orders'], async (eventType, payload) => {
      const client = await pool.connect();
      try {
        if (eventType === 'provider.assignment.accepted') {
           const { order_id, provider_id, customer_id } = payload;
           
           // Create a new active chat room
           await client.query(
             `INSERT INTO chat_rooms (order_id, customer_id, provider_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
             [order_id, customer_id, provider_id]
           );
           console.log(`[Chat Service] Chat room created for Order ${order_id}`);
           
        } else if (eventType === 'order.completed' || eventType === 'order.cancelled') {
           const { order_id } = payload;
           
           // Disable chat room
           await client.query(`UPDATE chat_rooms SET active = false WHERE order_id = $1`, [order_id]);
           
           // Broadcast chat closed
           const roomRes = await client.query(`SELECT id FROM chat_rooms WHERE order_id = $1`, [order_id]);
           if (roomRes.rows.length > 0) {
              io.to(roomRes.rows[0].id).emit('chat_closed', { order_id });
           }
           console.log(`[Chat Service] Chat room disabled for Order ${order_id}`);
        }
      } catch (err) {
        console.error('[Chat Service] Event processing failed:', err);
      } finally {
        client.release();
      }
    });

    server.listen(3009, () => {
      console.log('[Chat Service] Listening on port 3009');
    });
  } catch (err) {
    console.error('Failed to start Chat Service:', err);
  }
};

startServer();
