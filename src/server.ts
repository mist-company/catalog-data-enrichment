import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import { queue } from './util/queue';
import { FIND_TITLES_JOB_NAME } from './config';

const bullBoardExpressAdapter = new ExpressAdapter();
bullBoardExpressAdapter.setBasePath('/ui');
createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter: bullBoardExpressAdapter,
});
const app = express();
app.use('/ui', bullBoardExpressAdapter.getRouter());
app.use('/run', async (_, res) => {
  const [currentDate] = new Date().toISOString().split('T');
  await queue.add(FIND_TITLES_JOB_NAME, null, {
    deduplication: { id: `${FIND_TITLES_JOB_NAME}:${currentDate}` },
  });
  res.send('OK');
});

export default app;
