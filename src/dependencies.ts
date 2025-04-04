import { container } from 'tsyringe';
import { DatabaseHelper } from './helper/database-helper';
import { DatabaseTitleGateway } from './gateway/title/database-title.gateway';
import { DatabaseTorrentGateway } from './gateway/torrent/database-torrent.gateway';
import { HttpTorrentGateway } from './gateway/torrent/http-torrent.gateway';
import { QueueHelper } from './helper/queue-helper';
import { LoggerHelper } from './helper/logger-helper';

export const dependencies = container
  .register('LoggerMeta', { useValue: {} })
  .register('DatabaseHelper', DatabaseHelper)
  .register('QueueHelper', QueueHelper)
  .register('LoggerHelper', LoggerHelper)
  .register('TitleGateway', DatabaseTitleGateway)
  .register('TorrentGateway', DatabaseTorrentGateway)
  .register('SearchableTorrentGateway', HttpTorrentGateway);
