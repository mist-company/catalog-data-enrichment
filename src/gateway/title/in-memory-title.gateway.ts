import { Title } from '../../dto/title';
import { IdValueObject } from '../../value-object/id.value-object';
import { BaseTitleGateway } from './base-title.gateway';

export class InMemoryTitleGateway implements BaseTitleGateway {
  #titles: Title[] = [];

  async insert(title: Title): Promise<void> {
    const index = this.#titles.findIndex((t) => t._id.isEqual(title._id));
    if (index !== -1) {
      this.#titles[index] = title;
    } else {
      this.#titles.push(title);
    }
  }

  async get({ imdbId }: { imdbId: IdValueObject }): Promise<Title | null> {
    const title = this.#titles.find((t) => t._id.isEqual(imdbId));
    return title ?? null;
  }
}
