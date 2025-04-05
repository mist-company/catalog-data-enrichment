import { inject, injectable } from 'tsyringe';
import { Torrent } from '../../dto/torrent';
import { DatabaseHelper } from '../../helper/database.helper';

@injectable()
export class DatabaseTorrentGateway {
  readonly #database: DatabaseHelper;

  constructor(@inject(DatabaseHelper) database: DatabaseHelper) {
    this.#database = database;
  }

  async update(torrent: Torrent, options = {}): Promise<void> {
    const collection = await this.#database.getCollection('torrents');
    await collection.updateOne(
      { infoHash: torrent.infoHash },
      { $set: { ...torrent, imdbId: torrent.imdbId.toString() } },
      options,
    );
  }
}
