import { TitleIdValueObject } from '../value-object/title-id.vo';

export type Torrent = {
  imdbId?: TitleIdValueObject;
  tracker: string;
  title: string;
  magnetUri: string;
  infoHash: string;
  sizeBytes: number;
  seeds: number;
  peers: number;
};
