import { inject, injectable } from 'tsyringe';
import { JACKETT_URL } from '../../config';
import type { Torrent } from '../../dto/torrent';
import {
  BaseSearchableTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
} from './base-torrent.gateway';
import { LoggerHelper } from '../../helper/logger/logger.helper';
import { BaseLoggerHelper } from '../../helper/logger/base-logger.helper';

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
    const jackettUrl = this.buildJackettUrl();
    jackettUrl.searchParams.append('query', query);
    if (category !== BaseSearchableTorrentGatewayGategory.UNKNOWN) {
      jackettUrl.searchParams.append('category', this.#categories[category]);
    }
    const res = await fetch(jackettUrl);
    const { Results: data }: { Results?: JackettResponseItem[] } = await res.json();
    const torrents = this.mapJackettResponse(data);
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

  private buildJackettUrl(): URL {
    const jackettUrl = new URL('/api/v2.0/indexers/all/results', JACKETT_URL);
    jackettUrl.searchParams.append('apikey', process.env.JACKETT_API_KEY);
    return jackettUrl;
  }

  private mapJackettResponse(response: JackettResponseItem[]): Torrent[] {
    return response.map((item) => {
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
    });
  }
}
