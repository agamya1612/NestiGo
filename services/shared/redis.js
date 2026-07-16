const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

redis.on('error', (err) => {
  console.error('[Redis] Error:', err);
});

redis.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

module.exports = {
  redis,
};
