import { inject, injectable } from 'tsyringe';
import { JACKETT_URL } from '../../config';
import type { Torrent } from '../../dto/torrent';
import {
  BaseSearchableTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
} from './base-torrent.gateway';
import { LoggerHelper } from '../../helper/logger/logger.helper';
import { BaseLoggerHelper } from '../../helper/logger/base-logger.helper';
import { TorrentHelper } from '../../helper/torrent.helper';
import { TextHelper } from '../../helper/text.helper';

type JackettResponseItem = {
  Title: string;
  Tracker: string;
  InfoHash: string;
  MagnetUri: string;
  Link: string;
  Size: number;
  Seeders: number;
  Peers: number;
};

@injectable()
export class HttpTorrentGateway implements BaseSearchableTorrentGateway {
  readonly #logger: LoggerHelper;
  readonly #categories: Record<string, string> = {
    MOVIE: '2000',
    TV_SERIES: '5000',
  };

  constructor(@inject(BaseLoggerHelper) logger: LoggerHelper) {
    this.#logger = logger.child({ component: HttpTorrentGateway.name });
  }

  async search(query: string, category: BaseSearchableTorrentGatewayGategory): Promise<Torrent[]> {
    const jackettUrl = this.#buildJackettUrl();
    jackettUrl.searchParams.append('query', query);
    if (category !== BaseSearchableTorrentGatewayGategory.UNKNOWN) {
      jackettUrl.searchParams.append('category', this.#categories[category]);
    }
    const res = await fetch(jackettUrl);
    const { Results: data }: { Results?: JackettResponseItem[] } = await res.json();
    let torrents = await Promise.all(
      data.map(async (item) => {
        if (!item.InfoHash && item.Link) {
          const res = await fetch(item.Link, { redirect: 'manual' });
          const magnetUri = res.headers.get('location');
          if (magnetUri) {
            const infoHash = magnetUri.match(/btih:([a-zA-Z0-9]+)/)?.[1];
            item.InfoHash = infoHash;
            item.MagnetUri = magnetUri;
          }
        }
        return this.#mapJackettResponse(item);
      }),
    );
    torrents = torrents
      .filter((t) => t.infoHash)
      .map((torrent) => ({
        ...torrent,
        similarityScore: this.#calcSimilarity(torrent.title, query, category),
      }));
    this.#logger.debug(
      {
        query,
        category,
        torrents: torrents.map((t) => t.infoHash),
      },
      'search torrent results',
    );
    return torrents;
  }

  #buildJackettUrl(): URL {
    const jackettUrl = new URL('/api/v2.0/indexers/all/results', JACKETT_URL);
    jackettUrl.searchParams.append('apikey', process.env.JACKETT_API_KEY);
    return jackettUrl;
  }

  #mapJackettResponse(item: JackettResponseItem): Torrent {
    return {
      tracker: item.Tracker,
      title: item.Title,
      infoHash: item.InfoHash,
      magnetUri: item.MagnetUri,
      sizeBytes: item.Size,
      seeds: item.Seeders,
      peers: item.Peers,
      similarityScore: 0,
    };
  }

  #calcSimilarity(
    torrentTitle: string,
    query: string,
    category: BaseSearchableTorrentGatewayGategory,
  ): number {
    const torrentExtracted = TorrentHelper.parseTorrentTitle(torrentTitle);
    const queryExtracted = TorrentHelper.parseTorrentTitle(query);
    if (category === BaseSearchableTorrentGatewayGategory.TV_SERIES) {
      if (
        torrentExtracted.season !== queryExtracted.season ||
        torrentExtracted.episode !== queryExtracted.episode
      ) {
        return 0;
      }
      return TextHelper.calcSimilarity(
        `${torrentExtracted.title} S${torrentExtracted.season}E${torrentExtracted.episode}`,
        `${queryExtracted.title} S${queryExtracted.season}E${queryExtracted.episode}`,
      );
    }
    return TextHelper.calcSimilarity(
      `${torrentExtracted.title} ${torrentExtracted.year}`,
      `${queryExtracted.title} ${queryExtracted.year}`,
    );
  }
}
