import pino from 'pino';
import { PgHelper } from '../util/pg-helper';
import { MongoHelper } from '../util/mongo-helper';

export type NormalizeTitlesServiceProps = {
  logger: pino.Logger;
  pg: PgHelper;
  mongo: MongoHelper;
};

export class NormalizeTitlesService {
  private readonly logger: pino.Logger;
  private readonly pg: PgHelper;
  private readonly mongo: MongoHelper;

  constructor({ logger, pg, mongo }: NormalizeTitlesServiceProps) {
    this.logger = logger.child({ service: NormalizeTitlesService.name });
    this.pg = pg;
    this.mongo = mongo;
  }

  async execute(title): Promise<void> {
    this.logger.info(`normalizing title ${title.tconst}`);
    const collection = await this.mongo.getCollection('catalog', 'titles');
    const normalizedTitle = {
      imdbId: title.tconst,
      primaryTitle: title.primarytitle,
      originalTitle: title.originaltitle,
      startYear: title.startyear,
      endYear: title.endyear,
      runtimeMinutes: title.runtimeminutes,
      titleType: title.titletype,
      isAdult: title.isadult,
      genres: title.genres?.split(',') ?? [],
      ratings: [],
    };
    normalizedTitle.ratings = await this.getRawRatings(normalizedTitle.imdbId);
    if (['tvSeries', 'tvMiniSeries'].includes(normalizedTitle.titleType)) {
      const seasons = await this.getRawSeasons(normalizedTitle.imdbId);
      Object.assign(normalizedTitle, { seasons });
    }
    await collection.updateOne({ imdbId: normalizedTitle.imdbId }, { $set: normalizedTitle }, { upsert: true });
    this.logger.info(`title ${title.tconst} normalized`);
  }

  private async getRawRatings(imdbId: string) {
    const rows = await this.pg.query(
      `
      SELECT 
        averagerating,
        numvotes
      FROM title_ratings 
      WHERE tconst = $1
      AND averagerating IS NOT NULL
      AND numvotes IS NOT NULL
      LIMIT 1
    `,
      [imdbId],
    );
    return rows.map((row) => ({
      source: 'IMDB',
      value: row.averagerating,
      votes: row.numvotes,
    }));
  }

  private async getRawSeasons(imdbId: string) {
    const rows = await this.pg.query(
      `
      SELECT 
        te.tconst,
        te.seasonnumber,
        te.episodenumber,
        tb.primarytitle,
        tb.originaltitle,
        tb.runtimeminutes
      FROM title_episode te
      JOIN title_basics AS tb ON te.tconst = tb.tconst
      WHERE te.parenttconst = $1
      `,
      [imdbId],
    );
    const seasons = rows.reduce((acc, row) => {
      if (!acc[row.seasonnumber]) {
        acc[row.seasonnumber] = [];
      }
      acc[row.seasonnumber].push({
        imdbId: row.tconst,
        episodeNumber: row.episodenumber,
        primaryTitle: row.primarytitle,
        originalTitle: row.originaltitle,
        runtimeMinutes: row.runtimeminutes,
      });
      return acc;
    }, {});
    return seasons;
  }
}
