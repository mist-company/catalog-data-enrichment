import type { Torrent } from '../dto/torrent';
import type { Title } from '../dto/title';
import {
  type BaseSearchableTorrentGateway,
  type BaseTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
} from '../gateway/torrent/base-torrent.gateway';
import type { BaseTitleGateway } from '../gateway/title/base-title.gateway';
import { TitleIdValueObject } from '../value-object/title-id.vo';
import { inject, injectable } from 'tsyringe';
import { LoggerHelper } from '../helper/logger.helper';

export type FindTorrentsUseCaseInput = {
  imdbId: string;
};

@injectable()
export class FindTorrentsUseCase {
  readonly #logger: LoggerHelper;
  readonly #torrentGateway: BaseTorrentGateway;
  readonly #searchableTorrentGateway: BaseSearchableTorrentGateway;
  readonly #titleGateway: BaseTitleGateway;

  constructor(
    @inject('LoggerHelper') logger: LoggerHelper,
    @inject('TitleGateway') titleGateway: BaseTitleGateway,
    @inject('TorrentGateway') torrentGateway: BaseTorrentGateway,
    @inject('SearchableTorrentGateway')
    searchableTorrentGateway: BaseSearchableTorrentGateway,
  ) {
    this.#titleGateway = titleGateway;
    this.#torrentGateway = torrentGateway;
    this.#searchableTorrentGateway = searchableTorrentGateway;
    this.#logger = logger.child({ service: FindTorrentsUseCase.name });
  }

  async execute(input: FindTorrentsUseCaseInput): Promise<Torrent[]> {
    const imdbId = new TitleIdValueObject(input.imdbId);
    this.#logger.debug({ imdbId }, 'search torrents');
    const title = await this.#titleGateway.get({ imdbId: imdbId });
    if (!title) {
      this.#logger.info({ imdbId }, 'title not found');
      return [];
    }
    const query = this.buildQuery(title, imdbId.season, imdbId.episode);
    const category = this.buildCategory(title.titleType);
    const torrents = await this.#searchableTorrentGateway.search(query, category);
    if (!torrents.length) {
      this.#logger.info({ imdbId, query, category }, 'no torrents found');
      return [];
    }
    await Promise.all(
      torrents.map((torrent) =>
        this.#torrentGateway.update({ ...torrent, imdbId: imdbId }, { upsert: true }),
      ),
    );
    this.#logger.info(
      { imdbId, torrents: torrents.map((torrent) => torrent.infoHash) },
      'torrents found',
    );
    return torrents;
  }

  private buildQuery(title: Title, season: string, episode: string): string {
    if (season && episode) {
      return `${title.primaryTitle} S${season} E${episode}`;
    }
    return `${title.primaryTitle} ${title.startYear}`;
  }

  private buildCategory(titleType: string): BaseSearchableTorrentGatewayGategory {
    if (['movie'].includes(titleType)) {
      return BaseSearchableTorrentGatewayGategory.MOVIE;
    }
    if (['tvSeries'].includes(titleType)) {
      return BaseSearchableTorrentGatewayGategory.TV_SERIES;
    }
    return BaseSearchableTorrentGatewayGategory.UNKNOWN;
  }
}
