import { Job } from 'bullmq';
import { PORT, WORKER_CONCURRENCY } from './config';
import { worker } from './worker';
import { logger } from './util/logger';
import server from './server';

(async () => {
  server.listen(PORT, () => logger.info(`server listening on port ${PORT}`));
  await worker
    .on('ready', () => logger.info(`waiting for jobs - concurrency:${WORKER_CONCURRENCY}`))
    .on('failed', (job: Job, err: Error) => logger.error(err, `job ${job.name} failed: ${err.message}`))
    .run();
})();
