import { Job } from 'bullmq';
import { CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY, PORT } from './config';
import { worker } from './worker';
import { logger } from './util/logger';
import server from './server';

(async () => {
  server.listen(PORT, () => logger.info(`server listening on port ${PORT}`));
  await worker
    .on('ready', () => logger.info(`waiting for jobs - concurrency:${CATALOG_DATA_ENRICHMENT_QUEUE_CONCURRENCY}`))
    .on('failed', (job: Job, err: Error) => logger.error(job.data, `job ${job.name} failed: ${err.message}`))
    .run();
})();
