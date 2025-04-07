import type { Torrent } from '../dto/torrent';
import type { Title } from '../dto/title';
import {
  BaseSearchableTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
  BaseTorrentGateway,
} from '../gateway/torrent/base-torrent.gateway';
import { BaseTitleGateway } from '../gateway/title/base-title.gateway';
import { TitleIdValueObject } from '../value-object/title-id.vo';
import { inject, injectable } from 'tsyringe';
import { BaseLoggerHelper } from '../helper/logger/base-logger.helper';

export type FindTorrentsUseCaseInput = {
  imdbId: string;
};

@injectable()
export class FindTorrentsUseCase {
  readonly #logger: BaseLoggerHelper;
  readonly #torrentGateway: BaseTorrentGateway;
  readonly #searchableTorrentGateway: BaseSearchableTorrentGateway;
  readonly #titleGateway: BaseTitleGateway;

  constructor(
    @inject(BaseLoggerHelper) logger: BaseLoggerHelper,
    @inject(BaseTitleGateway) titleGateway: BaseTitleGateway,
    @inject(BaseTorrentGateway) torrentGateway: BaseTorrentGateway,
    @inject(BaseSearchableTorrentGateway)
    searchableTorrentGateway: BaseSearchableTorrentGateway,
  ) {
    this.#titleGateway = titleGateway;
    this.#torrentGateway = torrentGateway;
    this.#searchableTorrentGateway = searchableTorrentGateway;
    this.#logger = logger.child({ component: FindTorrentsUseCase.name });
  }

  async execute(input: FindTorrentsUseCaseInput): Promise<Torrent[]> {
    const imdbId = new TitleIdValueObject(input.imdbId);
    const loggerPayload = { imdbId: imdbId.toString() };
    this.#logger.info(loggerPayload, 'search torrents');
    const title = await this.#titleGateway.get({ imdbId: imdbId });
    if (!title) {
      this.#logger.info(loggerPayload, 'title not found');
      return [];
    }
    const query = this.buildQuery(title, imdbId.season, imdbId.episode);
    const category = this.buildCategory(title.titleType);
    Object.assign(loggerPayload, { query, category });
    const torrents = await this.#searchableTorrentGateway.search(query, category);
    if (!torrents.length) {
      this.#logger.info(loggerPayload, 'no torrents found');
      return [];
    }
    Object.assign(loggerPayload, { torrents: torrents.map((torrent) => torrent.infoHash) });
    await Promise.all(
      torrents.map((torrent) =>
        this.#torrentGateway.update({ ...torrent, imdbId }, { upsert: true }),
      ),
    );
    this.#logger.info(loggerPayload, 'torrents results');
    return torrents;
  }

  private buildQuery(title: Title, season: string, episode: string): string {
    if (season && episode) {
      return `${title.primaryTitle} S${season} E${episode}`;
    }
    return `${title.primaryTitle} ${title.startYear}`;
  }

  private buildCategory(titleType: string): BaseSearchableTorrentGatewayGategory {
    if (['tvSeries', 'tvMiniSeries'].includes(titleType)) {
      return BaseSearchableTorrentGatewayGategory.TV_SERIES;
    }
    return BaseSearchableTorrentGatewayGategory.MOVIE;
  }
}
