import pino from 'pino';
import { MongoHelper } from '../util/mongo-helper';
import { Torrent } from '../dto/torrent';

export type FindTorrentsServiceProps = {
  logger: pino.Logger;
  mongo: MongoHelper;
};

export class FindTorrentsService {
  private readonly logger: pino.Logger;
  private readonly mongo: MongoHelper;

  constructor({ logger, mongo }: FindTorrentsServiceProps) {
    this.logger = logger.child({ service: FindTorrentsService.name });
    this.mongo = mongo;
  }

  async execute({ imdbId }): Promise<void> {
    this.logger.debug(`${imdbId} search torrents started`);
    const titleCollection = await this.mongo.getCollection('titles');
    const torrentCollection = await this.mongo.getCollection('torrents');
    const title = await titleCollection.findOne({ _id: imdbId });
    if (!title) {
      this.logger.warn(`${imdbId} title not found`);
      return;
    }
    this.logger.debug(`${imdbId} title name: ${title.primaryTitle} - ${title.startYear} - ${title.titleType}`);
    if (['movie', 'short', 'video', 'tvMovie', 'tvShort'].includes(title.titleType)) {
      const torrents = await this.getYTSTorrents(title._id.toString());
      for (const torrent of torrents) {
        await torrentCollection.updateOne({ _id: torrent._id as unknown }, { $set: torrent }, { upsert: true });
        this.logger.info({ infoHash: torrent.infoHash }, `${imdbId} torrents inserted`);
      }
    }
    this.logger.info(`${imdbId} search torrents completed`);
  }

  private async getYTSTorrents(imdbId: string): Promise<Torrent[]> {
    const res = await fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`);
    const { data }: { data?: { movie } } = await res.json();
    if (data?.movie?.title !== null) {
      return data.movie.torrents.map(
        (torrent: any): Torrent => ({
          _id: torrent.hash,
          titleId: imdbId,
          infoHash: torrent.hash,
          quality: torrent.quality,
          ripType: torrent.type,
          url: torrent.url,
          sizeBytes: torrent.size_bytes,
          seeds: torrent.seeds,
          peers: torrent.peers,
          videoCodec: torrent.video_codec,
          audioChannels: torrent.audio_channels,
        }),
      );
    }
    return [];
  }
}
