import { container } from 'tsyringe';
import { DatabaseTitleGateway } from './gateway/title/database-title.gateway';
import { DatabaseTorrentGateway } from './gateway/torrent/database-torrent.gateway';
import { HttpTorrentGateway } from './gateway/torrent/http-torrent.gateway';
import { QueueHelper } from './helper/queue/queue.helper';
import { LoggerHelper } from './helper/logger/logger.helper';
import { BaseLoggerHelper, LoggerHelperMeta } from './helper/logger/base-logger.helper';
import { BaseQueueHelper } from './helper/queue/base-queue.helper';
import { BaseTitleGateway } from './gateway/title/base-title.gateway';
import {
  BaseSearchableTorrentGateway,
  BaseTorrentGateway,
} from './gateway/torrent/base-torrent.gateway';
import { DatabaseHelper } from './helper/database.helper';

export const dependencies = container
  .register(LoggerHelperMeta, { useValue: {} })
  .register(DatabaseHelper, DatabaseHelper)
  .register(BaseQueueHelper, QueueHelper)
  .register(BaseLoggerHelper, LoggerHelper)
  .register(BaseTitleGateway, DatabaseTitleGateway)
  .register(BaseTorrentGateway, DatabaseTorrentGateway)
  .register(BaseSearchableTorrentGateway, HttpTorrentGateway);
