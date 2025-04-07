import { inject, injectable } from 'tsyringe';
import { Torrent } from '../../dto/torrent';
import { DatabaseHelper } from '../../helper/database.helper';
import { LoggerHelper } from '../../helper/logger/logger.helper';
import { BaseLoggerHelper } from '../../helper/logger/base-logger.helper';

@injectable()
export class DatabaseTorrentGateway {
  readonly #database: DatabaseHelper;
  readonly #logger: LoggerHelper;

  constructor(
    @inject(DatabaseHelper) database: DatabaseHelper,
    @inject(BaseLoggerHelper) logger: LoggerHelper,
  ) {
    this.#database = database;
    this.#logger = logger.child({ component: DatabaseTorrentGateway.name });
  }

  async update(torrent: Torrent, options = {}): Promise<void> {
    const collection = await this.#database.getCollection('torrents');
    await collection.updateOne(
      { infoHash: torrent.infoHash },
      { $set: { ...torrent, imdbId: torrent.imdbId.toString() } },
      options,
    );
    this.#logger.debug(
      {
        title: torrent.title,
        infoHash: torrent.infoHash,
        imdbId: torrent.imdbId.toString(),
        options,
      },
      'torrent updated',
    );
  }
}
