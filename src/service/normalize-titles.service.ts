import pino from 'pino';
import { PgHelper } from '../util/pg-helper';
import { MongoHelper } from '../util/mongo-helper';
import { ENRICH_TITLE_JOB_NAME } from '../config';
import { Queue } from 'bullmq';

export type NormalizeTitlesServiceProps = {
  queue: Queue;
  logger: pino.Logger;
  pg: PgHelper;
  mongo: MongoHelper;
};

export class NormalizeTitlesService {
  private readonly logger: pino.Logger;
  private readonly queue: Queue;
  private readonly pg: PgHelper;
  private readonly mongo: MongoHelper;

  constructor({ logger, queue, pg, mongo }: NormalizeTitlesServiceProps) {
    this.logger = logger.child({ service: NormalizeTitlesService.name });
    this.queue = queue;
    this.pg = pg;
    this.mongo = mongo;
  }

  async execute({ imdbId }): Promise<void> {
    this.logger.debug(`${imdbId} title normalization started`);
    const collection = await this.mongo.getCollection('catalog', 'titles');
    const title = await this.getTitle(imdbId);
    this.logger.debug(`${imdbId} title name: ${title.primaryTitle} - ${title.startYear}`);
    const ratings = await this.getRatings(imdbId);
    Object.assign(title, { ratings });
    if (['tvSeries', 'tvMiniSeries'].includes(title.titleType)) {
      const seasons = await this.getSeasonsAndEpisodes(title.imdbId);
      this.logger.debug(`${imdbId} title seasons: ${Object.keys(seasons).length}`);
      Object.assign(title, { seasons });
    }
    await collection.updateOne({ imdbId: title.imdbId }, { $set: title }, { upsert: true });
    await this.queue.add(ENRICH_TITLE_JOB_NAME, { imdbId: title.imdbId });
    this.logger.info(`${imdbId} title normalization completed`);
  }

  private async getTitle(imdbId: string) {
    const [row] = await this.pg.query(
      `
      SELECT 
        tconst, 
        primary_title, 
        original_title, 
        start_year, 
        end_year, 
        runtime_minutes, 
        title_type, 
        is_adult, 
        genres
      FROM title_basics
      WHERE tconst = $1
      LIMIT 1
    `,
      [imdbId],
    );
    return {
      imdbId: row.tconst,
      primaryTitle: row.primary_title,
      originalTitle: row.original_title,
      startYear: row.start_year,
      endYear: row.end_year,
      runtimeMinutes: row.runtime_minutes,
      titleType: row.title_type,
      isAdult: row.is_adult,
      genres: row.genres?.split(',') ?? [],
    };
  }

  private async getRatings(imdbId: string) {
    const rows = await this.pg.query(
      `
      SELECT average_rating, num_votes
      FROM title_ratings 
      WHERE tconst = $1
      AND average_rating IS NOT NULL
      AND num_votes IS NOT NULL
      LIMIT 1
    `,
      [imdbId],
    );
    return rows.map((row) => ({
      source: 'IMDB',
      value: row.average_rating,
      votes: row.num_votes,
    }));
  }

  private async getSeasonsAndEpisodes(imdbId: string) {
    const rows = await this.pg.query(
      `
      SELECT 
        te.tconst, 
        te.season_number, 
        te.episode_number, 
        tb.primary_title, 
        tb.original_title, 
        tb.runtime_minutes
      FROM title_episode te
      JOIN title_basics AS tb ON te.tconst = tb.tconst
      WHERE te.parent_tconst = $1
      `,
      [imdbId],
    );
    const seasons = rows.reduce((acc, row) => {
      if (!acc[row.season_number]) {
        acc[row.season_number] = [];
      }
      acc[row.season_number].push({
        imdbId: row.tconst,
        episodeNumber: row.episode_number,
        primaryTitle: row.primary_title,
        originalTitle: row.original_title,
        runtimeMinutes: row.runtime_minutes,
      });
      return acc;
    }, {});
    return seasons;
  }
}
