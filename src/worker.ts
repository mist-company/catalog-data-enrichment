import { Job, Worker } from 'bullmq';
import {
  CATALOG_ENRICHMENT_QUEUE_NAME,
  FIND_TORRENT_JOB_NAME,
  WORKER_CONCURRENCY,
} from './config';
import { FindTorrentsUseCase } from './use-case/find-torrents.use-case';
import { dependencies } from './dependencies';
import { LoggerHelper } from './helper/logger-helper';

const logger = dependencies.resolve(LoggerHelper);
const searchTorrentsUseCase = dependencies.resolve(FindTorrentsUseCase);

export const worker = new Worker(
  CATALOG_ENRICHMENT_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === FIND_TORRENT_JOB_NAME) {
      const torrents = await searchTorrentsUseCase.execute({
        imdbId: job.data.imdbId,
      });
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
