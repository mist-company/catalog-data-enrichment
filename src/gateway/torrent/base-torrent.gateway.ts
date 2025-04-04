import type { Torrent } from '../../dto/torrent';

export type BaseTorrentGatewayUpdateOptions = {
  upsert?: boolean;
};

export interface BaseTorrentGateway {
  update(
    torrent: Torrent,
    options?: BaseTorrentGatewayUpdateOptions,
  ): Promise<void>;
}

export enum BaseSearchableTorrentGatewayGategory {
  MOVIE = 'MOVIE',
  TV_SERIES = 'TV_SERIES',
}

export interface BaseSearchableTorrentGateway {
  search(
    query: string,
    category: BaseSearchableTorrentGatewayGategory,
  ): Promise<Torrent[]>;
}
