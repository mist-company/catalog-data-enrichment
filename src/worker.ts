import { Job, Worker } from 'bullmq';
import { CATALOG_ENRICHMENT_QUEUE_NAME, FIND_TORRENT_JOB_NAME, WORKER_CONCURRENCY } from './config';
import { MongoHelper } from './util/mongo-helper';
import { logger } from './util/logger';
import { FindTorrentsService } from './service/find-torrents.service';

const mongo = new MongoHelper();
const findTorrentsService = new FindTorrentsService({ logger, mongo });

export const worker = new Worker(
  CATALOG_ENRICHMENT_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === FIND_TORRENT_JOB_NAME) {
      const torrents = await findTorrentsService.execute({ imdbId: job.data.imdbId });
      return torrents.map((torrent) => ({
        infoHash: torrent.infoHash,
        title: torrent.title,
      }));
    }
    logger.error(`unknown job name: ${job.name}`);
  },
  {
    autorun: false,
    concurrency: WORKER_CONCURRENCY,
    connection: { url: process.env.REDIS_URL },
  },
);
