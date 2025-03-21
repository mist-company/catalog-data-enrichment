import pino from 'pino';
import { MongoHelper } from '../util/mongo-helper';

export type EnrichTitleServiceProps = {
  logger: pino.Logger;
  mongo: MongoHelper;
};

export class EnrichTitleService {
  private readonly logger: pino.Logger;
  private readonly mongo: MongoHelper;

  constructor({ logger, mongo }: EnrichTitleServiceProps) {
    this.logger = logger.child({ service: EnrichTitleService.name });
    this.mongo = mongo;
  }

  async execute({ imdbId }): Promise<void> {
    this.logger.debug(`${imdbId} title enrichment started`);
    const collection = await this.mongo.getCollection('catalog', 'titles');
    const title = await collection.findOne({ imdbId });
    if (!title) {
      this.logger.warn(`${imdbId} title not found`);
      return;
    }
    this.logger.debug(`${imdbId} title name: ${title.primaryTitle} - ${title.startYear}`);
    this.logger.info(`${imdbId} title enrichment completed`);
  }
}
