import pg from 'pg';

export class PgHelper {
  private readonly pool: pg.Pool;
  private client: pg.PoolClient;

  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL });
  }

  async query(query: string, values: unknown[] = []) {
    if (!this.client) {
      this.client = await this.pool.connect();
    }
    const { rows } = await this.client.query(query, values);
    return rows;
  }

  async disconnect() {
    if (this.client) {
      this.client.release();
      this.client = undefined;
    }
    await this.pool.end();
  }
}
