export class TitleIdValueObject {
  readonly #id: string;
  readonly #season: string;
  readonly #episode: string;
  readonly #fullId: string;

  constructor(fullId: string) {
    const [id, season, episode] = fullId.split(':');
    this.#id = id;
    this.#season = season ? season.padStart(2, '0') : season;
    this.#episode = episode ? episode.padStart(2, '0') : episode;
    this.#fullId = fullId;
  }

  get id(): string {
    return this.#id;
  }

  get season(): string {
    return this.#season;
  }

  get episode(): string {
    return this.#episode;
  }

  toJSON(): object {
    return {
      id: this.#id,
      season: this.#season,
      episode: this.#episode,
      fullId: this.#fullId,
    };
  }

  isEqual(other: TitleIdValueObject): boolean {
    return this.#id === other.id;
  }

  toString(): string {
    return this.#fullId;
  }
}
