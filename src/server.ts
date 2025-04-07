import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express, { type Request, type Response } from 'express';
import { FindTorrentsUseCase } from './use-case/find-torrents.use-case';
import { dependencies } from './dependencies';
import { CATALOG_ENRICHMENT_QUEUE_NAME } from './config';
import { Queue } from 'bullmq';
import { LoggerHelper } from './helper/logger/logger.helper';

const bullBoardExpressAdapter = new ExpressAdapter().setBasePath('/ui');

createBullBoard({
  queues: [
    new BullMQAdapter(
      new Queue(CATALOG_ENRICHMENT_QUEUE_NAME, {
        connection: { url: process.env.REDIS_URL },
      }),
    ),
  ],
  serverAdapter: bullBoardExpressAdapter,
});

const app = express();
const logger = dependencies.resolve(LoggerHelper);
const findTorrentsUseCase = dependencies.resolve(FindTorrentsUseCase);

app.get('/api/torrents/:imdbId', async (req: Request, res: Response) => {
  try {
    const torrents = await findTorrentsUseCase.execute({
      imdbId: req.params.imdbId,
    });
    res.json(torrents);
  } catch (err) {
    logger.error({ err }, 'error fetching torrents');
    res.status(500).json({ error: 'internal Server Error' });
  }
});

app.use('/ui', bullBoardExpressAdapter.getRouter());

export default app;
