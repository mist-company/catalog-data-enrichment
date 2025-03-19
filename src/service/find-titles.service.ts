import pino from 'pino';
import { PgHelper } from '../util/pg-helper';
import { Queue } from 'bullmq';
import { NORMALIZE_TITLE_JOB_NAME } from '../config';

export type FindTitlesServiceProps = {
  logger: pino.Logger;
  pg: PgHelper;
  queue: Queue;
};

export class FindTitlesService {
  private readonly logger: pino.Logger;
  private readonly pg: PgHelper;
  private readonly queue: Queue;

  constructor({ logger, pg, queue }: FindTitlesServiceProps) {
    this.logger = logger.child({ service: FindTitlesService.name });
    this.pg = pg;
    this.queue = queue;
  }

  async execute(): Promise<void> {
    this.logger.info('findind titles');
    const limit = 1000;
    let offset = 0;
    let hasMore = false;
    let count = 0;
    do {
      const rows = await this.getRawTitles(offset, limit);
      hasMore = rows.length > 0;
      if (hasMore) {
        await this.queue.addBulk(rows.map((row) => ({ name: NORMALIZE_TITLE_JOB_NAME, data: row })));
        offset += limit;
        count += rows.length;
      }
    } while (hasMore);
    this.logger.info(`${count} titles found`);
  }

  private async getRawTitles(offset: number, limit: number) {
    const rows = await this.pg.query(`
      SELECT 
        tconst,
        primarytitle,
        originaltitle,
        startyear,
        endyear,
        runtimeminutes,
        genres,
        titletype,
        isadult
      FROM title_basics 
      WHERE titletype in ('movie', 'tvSeries', 'tvMiniSeries') 
      ORDER BY tconst DESC
      OFFSET ${offset} LIMIT ${limit}
    `);
    return rows;
  }
}
