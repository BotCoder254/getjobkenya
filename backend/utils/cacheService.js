const Redis = require('redis');

let client;

const initRedis = async () => {
  try {
    if (!client) {
      client = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis max retries reached. Giving up.');
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      client.on('error', (error) => {
        console.error('Redis error:', error);
      });

      client.on('ready', () => {
        console.log('Redis client connected and ready');
      });

      client.on('end', () => {
        console.log('Redis client disconnected');
        client = null;
      });

      await client.connect();
    }
  } catch (error) {
    console.error('Redis initialization error:', error);
    client = null;
  }
};

const getClient = async () => {
  if (!client) {
    await initRedis();
  }
  return client;
};

const get = async (key) => {
  const redisClient = await getClient();
  if (!redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const set = async (key, value, ttl = 3600) => {
  const redisClient = await getClient();
  if (!redisClient) return false;
  try {
    const serializedValue = JSON.stringify(value);
    await redisClient.set(key, serializedValue);
    if (ttl) {
      await redisClient.expire(key, ttl);
    }
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

const del = async (key) => {
  const redisClient = await getClient();
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

const getOrSet = async (key, fetchFn, ttl = 3600) => {
  const redisClient = await getClient();
  if (!redisClient) return await fetchFn();
  try {
    const cached = await get(key);
    if (cached) return cached;

    const data = await fetchFn();
    await set(key, data, ttl);
    return data;
  } catch (error) {
    console.error('Cache getOrSet error:', error);
    return await fetchFn();
  }
};

const clearPattern = async (pattern) => {
  const redisClient = await getClient();
  if (!redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => del(key)));
    }
    return true;
  } catch (error) {
    console.error('Cache clear pattern error:', error);
    return false;
  }
};

// Initialize Redis when the module is imported
initRedis();

module.exports = {
  initRedis,
  get,
  set,
  del,
  getOrSet,
  clearPattern,
}; 