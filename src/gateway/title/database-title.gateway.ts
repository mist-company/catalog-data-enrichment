import { inject, injectable } from 'tsyringe';
import { Title } from '../../dto/title';
import { DatabaseHelper } from '../../helper/database.helper';
import { BaseTitleGateway, BaseTitleGatewayGetInput } from './base-title.gateway';

@injectable()
export class DatabaseTitleGateway implements BaseTitleGateway {
  readonly #database: DatabaseHelper;

  constructor(@inject(DatabaseHelper) database: DatabaseHelper) {
    this.#database = database;
  }

  async get({ imdbId }: BaseTitleGatewayGetInput): Promise<Title | null> {
    const collection = await this.#database.getCollection('titles');
    const title = await collection.findOne<Title>({ _id: imdbId.id as unknown });
    return title ?? null;
  }
}
