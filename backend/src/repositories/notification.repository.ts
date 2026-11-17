import { db } from '../config/db.js';

export class NotificationRepository {
  async findAll(userId: string) {
    const res = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return res.rows;
  }

  async markAsRead(id: string, userId: string) {
    const res = await db.query(
      `UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return res.rows[0] || null;
  }

  async markAllAsRead(userId: string) {
    await db.query(
      `UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return true;
  }

  async create(userId: string, title: string, message: string, type: string = 'info', link?: string) {
    const res = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, type, link || null]
    );
    return res.rows[0];
  }
}

export const notificationRepository = new NotificationRepository();
