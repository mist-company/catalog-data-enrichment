import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express, { Request, Response } from 'express';
import { queue } from './util/queue';
import { MongoHelper } from './util/mongo-helper';
import { FindTorrentsService } from './service/find-torrents.service';
import { logger } from './util/logger';

const bullBoardExpressAdapter = new ExpressAdapter().setBasePath('/ui');

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter: bullBoardExpressAdapter,
});

const app = express();
const mongo = new MongoHelper();
const findTorrentsService = new FindTorrentsService({ logger, mongo });

app.get('/api/torrents/:imdbId', async (req: Request, res: Response) => {
  try {
    const torrents = await findTorrentsService.execute({ imdbId: req.params.imdbId });
    res.json(torrents);
  } catch (err) {
    logger.error({ err }, 'Error fetching torrents');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/ui', bullBoardExpressAdapter.getRouter());

export default app;
