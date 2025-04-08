import { IdValueObject } from '../value-object/id.value-object';

export type Torrent = {
  imdbId?: IdValueObject;
  tracker: string;
  title: string;
  magnetUri: string;
  infoHash: string;
  sizeBytes: number;
  seeds: number;
  peers: number;
  similarityScore: number;
};
