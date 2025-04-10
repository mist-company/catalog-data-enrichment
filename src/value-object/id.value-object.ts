export class IdValueObject {
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

  isEqual(other: IdValueObject): boolean {
    return this.#id === other.id;
  }

  isComposed(): boolean {
    return this.#season !== undefined && this.#episode !== undefined;
  }

  toJSON(): string {
    return this.#fullId;
  }

  toString(): string {
    return this.#fullId;
  }
}
