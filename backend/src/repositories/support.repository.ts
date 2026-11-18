import { db } from '../config/db.js';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export class SupportRepository {
  async findByUserId(userId: string): Promise<SupportTicket[]> {
    const res = await db.query<SupportTicket>(
      `SELECT * FROM support_tickets 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async findById(id: string, userId?: string): Promise<SupportTicket | null> {
    const conditions = ['id = $1'];
    const params: any[] = [id];

    if (userId) {
      conditions.push('user_id = $2');
      params.push(userId);
    }

    const res = await db.query<SupportTicket>(
      `SELECT * FROM support_tickets WHERE ${conditions.join(' AND ')}`,
      params
    );
    return res.rows[0] || null;
  }

  async create(data: {
    userId: string;
    subject: string;
    message: string;
    category?: string;
    priority?: string;
  }): Promise<SupportTicket> {
    const res = await db.query<SupportTicket>(
      `INSERT INTO support_tickets (user_id, subject, message, category, priority, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       RETURNING *`,
      [
        data.userId,
        data.subject,
        data.message,
        data.category || 'General',
        data.priority || 'medium',
      ]
    );
    return res.rows[0];
  }

  async updateResponse(id: string, adminResponse: string, status: string = 'resolved'): Promise<SupportTicket | null> {
    const res = await db.query<SupportTicket>(
      `UPDATE support_tickets 
       SET admin_response = $2, status = $3, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, adminResponse, status]
    );
    return res.rows[0] || null;
  }
}

export const supportRepository = new SupportRepository();
