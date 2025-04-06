import { Torrent } from '../../dto/torrent';
import {
  BaseSearchableTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
  BaseTorrentGateway,
  BaseTorrentGatewayUpdateOptions,
} from './base-torrent.gateway';

export class InMemoryTorrentGateway implements BaseTorrentGateway, BaseSearchableTorrentGateway {
  torrents: Torrent[] = [];

  async update(
    torrent: Torrent,
    options: BaseTorrentGatewayUpdateOptions = { upsert: true },
  ): Promise<void> {
    if (options.upsert) {
      const index = this.torrents.findIndex((t) => t.imdbId === torrent.imdbId);
      if (index !== -1) {
        this.torrents[index] = torrent;
      } else {
        this.torrents.push(torrent);
      }
    }
  }

  search(query: string, category: BaseSearchableTorrentGatewayGategory): Promise<Torrent[]> {
    const torrents = this.torrents.filter((torrent) =>
      torrent.title.toLowerCase().includes(query.toLowerCase()),
    );
    return Promise.resolve(
      torrents.filter((torrent) => {
        if (category === BaseSearchableTorrentGatewayGategory.UNKNOWN) {
          return true;
        }
        const titleCategory =
          !!torrent.imdbId.season && !!torrent.imdbId.episode
            ? BaseSearchableTorrentGatewayGategory.TV_SERIES
            : BaseSearchableTorrentGatewayGategory.MOVIE;
        return titleCategory === category;
      }),
    );
  }
}
