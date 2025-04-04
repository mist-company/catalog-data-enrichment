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
import { LoggerHelper } from '../helper/logger-helper';

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

  async execute({ imdbId }): Promise<Torrent[]> {
    const { id, season, episode } = new TitleIdValueObject(imdbId);
    this.#logger.debug({ id, season, episode }, 'search torrents');
    const title = await this.#titleGateway.get({ imdbId: id });
    if (!title) {
      this.#logger.info({ id, season, episode }, 'title not found');
      return [];
    }
    const query = this.buildQuery(title, season, episode);
    const category = this.buildCategory(title.titleType);
    const torrents = await this.#searchableTorrentGateway.search(
      query,
      category,
    );
    if (!torrents.length) {
      this.#logger.info({ id, season, episode }, 'no torrents found');
      return [];
    }
    await Promise.all(
      torrents.map((torrent) =>
        this.#torrentGateway.update({ ...torrent, imdbId }, { upsert: true }),
      ),
    );
    this.#logger.info(
      { id, season, episode, length: torrents.length },
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

  private buildCategory(
    titleType: string,
  ): BaseSearchableTorrentGatewayGategory {
    if (['movie'].includes(titleType)) {
      return BaseSearchableTorrentGatewayGategory.MOVIE;
    }
    if (['tvSeries'].includes(titleType)) {
      return BaseSearchableTorrentGatewayGategory.TV_SERIES;
    }
    throw new Error(`unknown title type: ${titleType}`);
  }
}
