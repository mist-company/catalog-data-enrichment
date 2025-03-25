import { Job, Worker } from 'bullmq';
import {
  CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY,
  CATALOG_DATA_ENRICHMENT_QUEUE_NAME,
  ENRICH_TITLE_JOB_NAME,
  FIND_TITLES_JOB_NAME,
  NORMALIZE_TITLE_JOB_NAME,
} from './config';
import { PgHelper } from './util/pg-helper';
import { MongoHelper } from './util/mongo-helper';
import { FindTitlesService } from './service/find-titles.service';
import { NormalizeTitlesService } from './service/normalize-titles.service';
import { queue } from './util/queue';
import { logger } from './util/logger';
import { EnrichTitleService } from './service/enrich-title.service';

const pg = new PgHelper();
const mongo = new MongoHelper();
const findTitlesService = new FindTitlesService({ logger, pg, queue });
const normalizeTitleService = new NormalizeTitlesService({ logger, pg, mongo, queue });
const enrichTitleService = new EnrichTitleService({ logger, mongo });

export const worker = new Worker(
  CATALOG_DATA_ENRICHMENT_QUEUE_NAME,
  async (job: Job) => {
    switch (job.name) {
      case FIND_TITLES_JOB_NAME:
        await findTitlesService.execute();
        break;
      case NORMALIZE_TITLE_JOB_NAME:
        await normalizeTitleService.execute(job.data);
        break;
      case ENRICH_TITLE_JOB_NAME:
        await enrichTitleService.execute(job.data);
        break;
      default:
        logger.error(`unknown job name: ${job.name}`);
    }
  },
  {
    autorun: false,
    concurrency: CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY,
    connection: { url: process.env.REDIS_URL },
  },
);
