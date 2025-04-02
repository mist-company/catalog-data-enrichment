import pino from 'pino';
import { MongoHelper } from '../util/mongo-helper';
import { Torrent } from '../dto/torrent';
import { Title } from '../dto/title';
import { JACKETT_URL } from '../config';

export interface JackettResponseItem {
  Title: string;
  Tracker: string;
  InfoHash: string;
  MagnetUri: string;
  Link: string;
  Size: number;
  Seeders: number;
  Peers: number;
}

export type FindTorrentsServiceProps = {
  logger: pino.Logger;
  mongo: MongoHelper;
};

export class FindTorrentsService {
  private readonly logger: pino.Logger;
  private readonly mongo: MongoHelper;

  constructor({ logger, mongo }: FindTorrentsServiceProps) {
    this.mongo = mongo;
    this.logger = logger.child({ service: FindTorrentsService.name });
  }

  async execute({ imdbId }): Promise<Torrent[]> {
    const { id, season, episode } = this.desconstructureId(imdbId);
    this.logger.debug({ id, season, episode }, 'search torrents started');
    const titleCollection = await this.mongo.getCollection('titles');
    const torrentCollection = await this.mongo.getCollection('torrents');
    const title = await titleCollection.findOne<Title>({ _id: id as unknown });
    if (!title) {
      this.logger.info({ id, season, episode }, 'title not found');
      return [];
    }
    const query = this.buildQuery(title, season, episode);
    const category = this.buildCategory(title.titleType);
    const torrents = await this.getJackettTorrents(query, category);
    if (!torrents.length) {
      this.logger.info({ id, season, episode }, 'no torrents found');
      return [];
    }
    await torrentCollection.bulkWrite(
      torrents.map((torrent) => ({
        updateOne: {
          filter: { infoHash: torrent.infoHash },
          update: { $set: { ...torrent, imdbId } },
          upsert: true,
        },
      })),
    );
    this.logger.info({ id, season, episode, length: torrents.length }, 'search torrents completed');
    return torrents;
  }

  private desconstructureId(id: string): { id: string; season: string; episode: string } {
    const [imdbId, season, episode] = id.split(':');
    return {
      id: imdbId,
      season: season ? season.padStart(2, '0') : season,
      episode: episode ? episode.padStart(2, '0') : episode,
    };
  }

  private buildQuery(title: Title, season: string, episode: string): string {
    if (season && episode) {
      return `${title.primaryTitle} S${season} E${episode}`;
    }
    return `${title.primaryTitle} ${title.startYear}`;
  }

  private buildCategory(titleType: string): string {
    if (['movie'].includes(titleType)) {
      return '2000';
    }
    if (['tvSeries'].includes(titleType)) {
      return '5000';
    }
    return '';
  }

  private buildJackettUrl(): URL {
    const jackettUrl = new URL('/api/v2.0/indexers/all/results', JACKETT_URL);
    jackettUrl.searchParams.append('apikey', process.env.JACKETT_API_KEY);
    return jackettUrl;
  }

  private async getJackettTorrents(query: string, category: string): Promise<Torrent[]> {
    this.logger.debug({ query, category }, 'searching torrents');
    const jackettUrl = this.buildJackettUrl();
    jackettUrl.searchParams.append('query', query);
    jackettUrl.searchParams.append('category', category);
    const res = await fetch(jackettUrl);
    const { Results: data }: { Results?: JackettResponseItem[] } = await res.json();
    this.logger.debug({ query, category, length: data.length }, 'torrents found');
    return this.mapJackettResponse(data);
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
