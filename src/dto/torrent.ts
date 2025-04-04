export type Torrent = {
  imdbId?: string;
  tracker: string;
  title: string;
  magnetUri: string;
  infoHash: string;
  sizeBytes: number;
  seeds: number;
  peers: number;
};
