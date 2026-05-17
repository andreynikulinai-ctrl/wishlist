import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const KEY = 'wishlist:bookings';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method === 'GET') {
      const data = await redis.get(KEY) || {};
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Некорректные данные' });
      }

      const bookings = (await redis.get(KEY)) || {};

      if (bookings[id]) {
        return res.status(409).json({ error: 'Подарок уже забронирован' });
      }

      bookings[id] = new Date().toISOString();
      await redis.set(KEY, bookings);

      return res.status(200).json({ ok: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
