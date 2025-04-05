import { Queue } from 'bullmq';
import { CATALOG_ENRICHMENT_QUEUE_NAME, REDIS_URL } from '../config';

export class QueueHelper {
  readonly #queue: Queue;
  constructor() {
    this.#queue = new Queue(CATALOG_ENRICHMENT_QUEUE_NAME, {
      connection: { url: REDIS_URL },
    });
  }

  async add(name: string, data: unknown) {
    await this.#queue.add(name, data);
  }
}
