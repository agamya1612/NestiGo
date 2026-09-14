const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'nestigo-services',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
const activeConsumers = [];

const gracefulShutdown = async () => {
  console.log('\n[Kafka] Gracefully shutting down...');
  try {
    await producer.disconnect();
    for (const consumer of activeConsumers) {
      await consumer.disconnect();
    }
    console.log('[Kafka] Disconnected successfully');
    process.exit(0);
  } catch (err) {
    console.error('[Kafka] Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

const connectProducer = async () => {
  await producer.connect();
};

const publishEvent = async (topic, eventType, payload) => {
  await producer.send({
    topic,
    messages: [
      {
        key: eventType,
        value: JSON.stringify(payload),
      },
    ],
  });
  console.log(`[Kafka] Published ${eventType} to ${topic}`);
};

const createConsumer = async (groupId, topics, messageHandler) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventType = message.key ? message.key.toString() : 'unknown';
      let payload;
      
      try {
        payload = JSON.parse(message.value.toString());
      } catch (err) {
        console.error(`[Kafka] CRITICAL: Invalid JSON received in topic ${topic}. Bypassing retry and pushing to DLQ.`);
        await publishEvent('dlq', 'message.parse_failed', { originalTopic: topic, eventType, rawValue: message.value.toString(), error: err.message });
        return; // Acknowledge message and skip processing
      }

      console.log(`[Kafka] Consumed ${eventType} from ${topic}`);
      
      let attempts = 0;
      while (attempts < 3) {
        try {
          await messageHandler(eventType, payload);
          break; // Success
        } catch (err) {
          attempts++;
          if (attempts >= 3) {
            console.error(`[Kafka] Message failed 3 times, pushing to DLQ: ${eventType}`);
            await publishEvent('dlq', 'message.failed', { originalTopic: topic, eventType, payload, error: err.message });
          } else {
            console.warn(`[Kafka] Retrying message ${eventType} (${attempts}/3)`);
            // Wait 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    },
  });

  activeConsumers.push(consumer);
  return consumer;
};

module.exports = {
  kafka,
  connectProducer,
  publishEvent,
  createConsumer,
};
