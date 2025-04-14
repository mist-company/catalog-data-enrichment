import * as ppt from 'parse-torrent-title';
import { Title } from '../dto/title';
import { ValidationError } from '../errors/validation-error';

type ParseTorrentTitleOutput = {
  title: string;
  year?: number;
  episode?: number;
  season?: number;
};

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

  static parseTorrentTitle(torrentTitle: string): ParseTorrentTitleOutput {
    const { title, year, season, episode } = ppt.parse(torrentTitle);
    return { title, year, episode, season };
  }
}
