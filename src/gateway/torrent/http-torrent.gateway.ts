import { injectable } from 'tsyringe';
import { JACKETT_URL } from '../../config';
import type { Torrent } from '../../dto/torrent';
import type { BaseSearchableTorrentGateway, BaseSearchableTorrentGatewayGategory } from './base-torrent.gateway';

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
  readonly #categories: Record<string, string> = {
    MOVIE: '2000',
    TV_SERIES: '5000',
  };

  async search(query: string, category: BaseSearchableTorrentGatewayGategory): Promise<Torrent[]> {
    const jackettUrl = this.buildJackettUrl();
    jackettUrl.searchParams.append('query', query);
    jackettUrl.searchParams.append('category', this.#categories[category]);
    const res = await fetch(jackettUrl);
    const { Results: data }: { Results?: JackettResponseItem[] } = await res.json();
    return this.mapJackettResponse(data);
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
      };
    });
  }
}
