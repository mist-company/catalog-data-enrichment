import { Title } from '../dto/title';
import { ValidationError } from '../errors/validation-error';

export class TorrentHelper {
  static buildQueriesFromTitle(title: Title, episode?: Title): string[] {
    if (['tvSeries', 'tvMiniSeries', 'tvEpisode'].includes(title.titleType) && !episode) {
      throw new ValidationError('Episode is required for TV series');
    }
    const queries: string[] = [];
    if (episode) {
      const seasonNumber = episode._id.season;
      const episodeNumber = episode._id.episode;
      queries.push(`${title.primaryTitle} S${seasonNumber}E${episodeNumber}`);
      queries.push(`${title.originalTitle} S${seasonNumber}E${episodeNumber}`);
      queries.push(
        `${title.primaryTitle} S${seasonNumber}E${episodeNumber} ${episode.originalTitle}`,
      );
      queries.push(
        `${title.originalTitle} S${seasonNumber}E${episodeNumber} ${episode.originalTitle}`,
      );
    } else {
      queries.push(`${title.primaryTitle} ${title.startYear}`);
      queries.push(`${title.originalTitle} ${title.startYear}`);
    }
    return [...new Set(queries)];
  }

  static extractCleanTitle(torrentName: string): string {
    const cleaned = torrentName
      .replace(/\.[^.]+$/, '') // remove extensão
      .replace(/[._-]/g, ' ') // normaliza separadores
      .replace(/\s+/g, ' ') // normaliza espaços
      .trim();

    const balanced = cleaned.replace(/^\(+/, '').replace(/\)+$/, '').trim();

    const seriesMatch = balanced.match(/^(.*?)(?:\s+)?S(\d{2})E(\d{2})/i);
    if (seriesMatch) {
      const [, rawTitle, seasonStr, episodeStr] = seriesMatch;
      return `${rawTitle.trim()} S${seasonStr}E${episodeStr}`;
    }

    const movieMatch = balanced.match(/^(.*?)\s*(?:\(|\[)?(19\d{2}|20\d{2})(?:\)|\])?/);
    if (movieMatch) {
      const [, rawTitle, yearStr] = movieMatch;
      return `${rawTitle.trim()} ${yearStr}`;
    }

    return `${balanced}`;
  }
}
