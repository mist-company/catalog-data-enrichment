import type { Torrent } from '../../dto/torrent';

export type BaseTorrentGatewayUpdateOptions = {
  upsert?: boolean;
};

export interface BaseTorrentGateway {
  update(torrent: Torrent, options?: BaseTorrentGatewayUpdateOptions): Promise<void>;
}

export enum BaseSearchableTorrentGatewayGategory {
  MOVIE = 'MOVIE',
  TV_SERIES = 'TV_SERIES',
  UNKNOWN = 'UNKNOWN',
}

export interface BaseSearchableTorrentGateway {
  search(query: string, category: BaseSearchableTorrentGatewayGategory): Promise<Torrent[]>;
}

export const BaseTorrentGateway = Symbol.for('BaseTorrentGateway');
export const BaseSearchableTorrentGateway = Symbol.for('BaseSearchableTorrentGateway');
