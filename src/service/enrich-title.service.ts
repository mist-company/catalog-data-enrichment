import pino from 'pino';
import { MongoHelper } from '../util/mongo-helper';

export type EnrichTitleServiceProps = {
  logger: pino.Logger;
  mongo: MongoHelper;
};

export class EnrichTitleService {
  private readonly logger: pino.Logger;
  private readonly mongo: MongoHelper;

  constructor({ logger, mongo }: EnrichTitleServiceProps) {
    this.logger = logger.child({ service: EnrichTitleService.name });
    this.mongo = mongo;
  }

  async execute({ imdbId }): Promise<void> {
    this.logger.debug(`${imdbId} title enrichment started`);
    const collection = await this.mongo.getCollection('catalog', 'titles');
    const title = await collection.findOne({ imdbId });
    if (!title) {
      this.logger.warn(`${imdbId} title not found`);
      return;
    }
    this.logger.debug(`${imdbId} title name: ${title.primaryTitle} - ${title.startYear}`);
    if (title.titleType === 'movie') {
      const ytsTitle = await this.getYTSTitle(title.imdbId);
      if (!ytsTitle) {
        this.logger.debug(`${imdbId} title not found in YTS`);
        return;
      }
      Object.assign(title, ytsTitle);
    }
    await collection.updateOne({ imdbId: title.imdbId }, { $set: title }, { upsert: true });
    this.logger.info(`${imdbId} title enrichment completed`);
  }

  private async getYTSTitle(imdbId: string) {
    const res = await fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`);
    const { data }: { data?: { movie } } = await res.json();
    if (data?.movie?.title !== null) {
      return {
        descriptionIntro: data.movie.description_intro,
        descriptionFull: data.movie.description_full,
        trailers: [
          {
            code: data.movie.yt_trailer_code,
            type: 'youtube',
          },
        ],
        covers: [
          { url: data.movie.large_cover_image, size: 'large' },
          { url: data.movie.medium_cover_image, size: 'medium' },
          { url: data.movie.small_cover_image, size: 'small' },
        ],
        torrents: data.movie.torrents.map((torrent) => ({
          hash: torrent.hash,
          quality: torrent.quality,
          type: torrent.type,
          url: torrent.url,
          size: torrent.size_bytes,
          seeds: torrent.seeds,
          peers: torrent.peers,
          videoCodec: torrent.video_codec,
          audioChannels: torrent.audio_channels,
        })),
      };
    }
    return null;
  }
}
