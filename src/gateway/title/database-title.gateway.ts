import { inject, singleton } from 'tsyringe';
import { Title } from '../../dto/title';
import { DatabaseHelper } from '../../helper/database.helper';
import { BaseTitleGateway, BaseTitleGatewayGetInput } from './base-title.gateway';
import { IdValueObject } from '../../value-object/id.value-object';

@singleton()
export class DatabaseTitleGateway implements BaseTitleGateway {
  readonly #database: DatabaseHelper;

  constructor(@inject(DatabaseHelper) database: DatabaseHelper) {
    this.#database = database;
  }

  async get({ imdbId }: BaseTitleGatewayGetInput): Promise<Title | null> {
    const collection = await this.#database.getCollection('titles');
    if (imdbId.isComposed()) {
      const episodeId = await this.#getEpisodeId(imdbId);
      if (!episodeId) {
        return null;
      }
      const title = await collection.findOne<Title>({
        _id: episodeId.id as unknown,
      });
      return title ? { ...title, _id: imdbId } : null;
    }
    const title = await collection.findOne<Title>({ _id: imdbId.id as unknown });
    return title ?? null;
  }

  async #getEpisodeId(imdbId: IdValueObject): Promise<IdValueObject | null> {
    const collection = await this.#database.getCollection('episodes');
    const episode = await collection.findOne({
      parentId: imdbId.id as unknown,
      seasonNumber: +imdbId.season,
      episodeNumber: +imdbId.episode,
    });
    return episode ? new IdValueObject(episode._id.toString()) : null;
  }
}
