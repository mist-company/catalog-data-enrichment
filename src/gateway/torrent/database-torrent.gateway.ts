import { inject, injectable } from 'tsyringe';
import { Torrent } from '../../dto/torrent';
import { DatabaseHelper } from '../../helper/database.helper';
import { LoggerHelper } from '../../helper/logger/logger.helper';
import { BaseLoggerHelper } from '../../helper/logger/base-logger.helper';
import { BaseTorrentGatewayListInput } from './base-torrent.gateway';
import { IdValueObject } from '../../value-object/id.value-object';

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

  async get(input: { infoHash: string }): Promise<Torrent> {
    const collection = await this.#database.getCollection('torrents');
    const torrent = await collection.findOne<Torrent>({ infoHash: input.infoHash });
    if (!torrent) {
      throw new Error(`Torrent not found with infoHash: ${input.infoHash}`);
    }
    this.#logger.debug({ torrent }, 'torrent retrieved');
    return { ...torrent, imdbId: new IdValueObject(torrent.imdbId as unknown as string) };
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

  async list(input: BaseTorrentGatewayListInput): Promise<Torrent[]> {
    const collection = await this.#database.getCollection('torrents');
    const query: Record<string, string> = {};
    if (input.imdbId) {
      query.imdbId = input.imdbId.toString();
    }
    if (input.infoHash) {
      query.infoHash = input.infoHash;
    }
    const torrents = await collection.find<Torrent>(query).toArray();
    this.#logger.debug({ input, torrents: torrents.length }, 'torrents listed');
    return torrents.map((torrent) => ({
      ...torrent,
      imdbId: new IdValueObject(torrent.imdbId as unknown as string),
    }));
  }
}
