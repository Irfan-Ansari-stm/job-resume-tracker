import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

export const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const db = {
  /**
   * Execute parameterized raw SQL query
   */
  async query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (process.env.DEBUG_SQL === 'true') {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }
      return res;
    } catch (error) {
      console.error('Database query error:', { text, error });
      throw error;
    }
  },

  /**
   * Run operations inside a PostgreSQL transaction with raw SQL
   */
  async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  /**
   * Check database connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const res = await pool.query('SELECT 1 as connected');
      return res.rows[0].connected === 1;
    } catch (err) {
      console.error('Database connection test failed:', err);
      return false;
    }
  },
};
