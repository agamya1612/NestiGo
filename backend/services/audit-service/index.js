const { pool } = require('../shared/db');
const { createConsumer } = require('../shared/kafka');

const startAuditService = async () => {
  try {
    const topics = ['orders', 'payments', 'provider.assignments', 'notifications'];
    
    console.log('[Audit Service] Starting Black Box Recorder on topics:', topics.join(', '));
    
    await createConsumer('audit-service-group', topics, async (eventType, payload, topic) => {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO audit_logs (topic, event_type, payload) VALUES ($1, $2, $3)`,
          [topic, eventType, JSON.stringify(payload)]
        );
        console.log(`[Audit Service] Recorded event: ${eventType} from topic: ${topic}`);
      } catch (err) {
        console.error('[Audit Service] Failed to record event:', err);
      } finally {
        client.release();
      }
    });

    // Keeping process alive since there's no Express server
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (err) {
    console.error('Failed to start Audit Service:', err);
  }
};

startAuditService();
