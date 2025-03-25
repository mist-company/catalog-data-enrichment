import pino from 'pino';
import { PgHelper } from '../util/pg-helper';
import { Queue } from 'bullmq';
import { NORMALIZE_TITLE_JOB_NAME, SUPPORTED_TITLE_TYPES } from '../config';

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
    const types = SUPPORTED_TITLE_TYPES;
    const limit = 500;
    let offset = 0;
    let hasMore = false;
    let count = 0;
    this.logger.info(`findind titles to normalize with types: ${types.join(', ')}`);
    do {
      const rows = await this.getRawTitles(offset, limit, SUPPORTED_TITLE_TYPES);
      hasMore = rows.length > 0;
      if (hasMore) {
        await this.queue.addBulk(
          rows.map(({ tconst }) => ({
            name: NORMALIZE_TITLE_JOB_NAME,
            data: { imdbId: tconst },
            opts: {
              deduplication: { id: `${NORMALIZE_TITLE_JOB_NAME}:${tconst}` },
            },
          })),
        );
        offset += limit;
        count += rows.length;
      }
    } while (hasMore);
    this.logger.info(`${count} titles founded to normalize with types: ${types.join(', ')}`);
  }

  private async getRawTitles(offset: number, limit: number, titleTypes: string[]) {
    const rows = await this.pg.query(`
      SELECT tconst
      FROM title_basics 
      WHERE title_type in (${titleTypes.map((titleType) => `'${titleType}'`).join(',')})
      ORDER BY tconst DESC
      OFFSET ${offset} LIMIT ${limit}
    `);
    return rows;
  }
}
