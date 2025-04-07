import { Queue } from 'bullmq';
import { CATALOG_ENRICHMENT_QUEUE_NAME, REDIS_URL } from '../../config';
import { LoggerHelper } from '../logger/logger.helper';
import { inject, injectable } from 'tsyringe';
import { BaseLoggerHelper } from '../logger/base-logger.helper';
import { BaseQueueHelper } from './base-queue.helper';

@injectable()
export class QueueHelper implements BaseQueueHelper {
  readonly #queue: Queue;
  readonly #logger: LoggerHelper;

  constructor(@inject(BaseLoggerHelper) logger: LoggerHelper) {
    this.#queue = new Queue(CATALOG_ENRICHMENT_QUEUE_NAME, {
      connection: { url: REDIS_URL },
    });
    this.#logger = logger.child({ component: QueueHelper.name });
  }

  async add(name: string, data: unknown) {
    await this.#queue.add(name, data, { attempts: 3 });
    this.#logger.debug({ name, data }, 'job added to queue');
  }
}
