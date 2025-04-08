import { Torrent } from '../../dto/torrent';
import {
  BaseSearchableTorrentGateway,
  BaseSearchableTorrentGatewayGategory,
  BaseTorrentGateway,
  BaseTorrentGatewayListInput,
  BaseTorrentGatewayUpdateOptions,
} from './base-torrent.gateway';

export class InMemoryTorrentGateway implements BaseTorrentGateway, BaseSearchableTorrentGateway {
  torrents: Torrent[] = [];

  async get(input: { infoHash: string }): Promise<Torrent> {
    const torrent = this.torrents.find((t) => t.infoHash === input.infoHash);
    if (!torrent) {
      throw new Error(`Torrent not found with infoHash: ${input.infoHash}`);
    }
    return Promise.resolve(torrent);
  }

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

  async list(input: BaseTorrentGatewayListInput): Promise<Torrent[]> {
    const torrents = this.torrents.filter((torrent) => {
      if (input.imdbId && torrent.imdbId.isEqual(input.imdbId)) {
        return false;
      }
      if (input.infoHash && torrent.infoHash !== input.infoHash) {
        return false;
      }
      return true;
    });
    return Promise.resolve(torrents);
  }
}
