import type { Torrent } from '../dto/torrent';
import {
  BaseSearchableTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
  BaseTorrentGateway,
} from '../gateway/torrent/base-torrent.gateway';
import { BaseTitleGateway } from '../gateway/title/base-title.gateway';
import { IdValueObject } from '../value-object/id.value-object';
import { inject, injectable } from 'tsyringe';
import { BaseLoggerHelper } from '../helper/logger/base-logger.helper';
import { TorrentHelper } from '../helper/torrent.helper';
import { TextHelper } from '../helper/text.helper';

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
    const imdbId = new IdValueObject(input.imdbId);
    const loggerPayload = { imdbId: imdbId.toString() };
    // the line below remove the composed id to get the title
    const title = await this.#titleGateway.get({ imdbId: new IdValueObject(imdbId.id) });
    if (!title) {
      this.#logger.info(loggerPayload, 'title not found');
      return [];
    }
    const episode = imdbId.isComposed() ? await this.#titleGateway.get({ imdbId }) : null;
    const queries = TorrentHelper.buildQueriesFromTitle(title, episode);
    const category = this.buildCategory(title.titleType);
    Object.assign(loggerPayload, { queries, category });
    this.#logger.info(loggerPayload, 'search torrents');
    let torrents = (
      await Promise.all(
        queries.map((query) => this.#searchableTorrentGateway.search(query, category)),
      )
    ).flat();
    if (!torrents.length) {
      this.#logger.info(loggerPayload, 'no torrents found');
      return [];
    }
    torrents = torrents.map((torrent) => ({
      ...torrent,
      imdbId,
      similarityScore: this.calcSimilarity(torrent, queries),
    }));
    Object.assign(loggerPayload, { torrents: torrents.length });
    await Promise.all(
      torrents.map((torrent) => this.#torrentGateway.update({ ...torrent }, { upsert: true })),
    );
    this.#logger.info(loggerPayload, 'torrents results');
    return torrents;
  }

  private buildCategory(titleType: string): BaseSearchableTorrentGatewayGategory {
    if (['tvSeries', 'tvMiniSeries'].includes(titleType)) {
      return BaseSearchableTorrentGatewayGategory.TV_SERIES;
    }
    return BaseSearchableTorrentGatewayGategory.MOVIE;
  }

  private calcSimilarity(torrent: Torrent, queries: string[]): number {
    const sanitizedTorrentTitle = TorrentHelper.extractCleanTitle(torrent.title);
    const similarities = queries.map((query) => {
      return TextHelper.calcSimilarity(sanitizedTorrentTitle, query);
    });
    return Math.max(...similarities);
  }
}
