import { Title } from '../dto/title';
import { ValidationError } from '../errors/validation-error';

export class TorrentHelper {
  static buildQueriesFromTitle(title: Title, episode?: Title): string[] {
    if (['tvSeries', 'tvMiniSeries', 'tvEpisode'].includes(title.titleType) && !episode) {
      throw new ValidationError('Episode is required for TV series');
    }
    const queries: string[] = [];
    const baseTitle = title.originalTitle.trim();
    if (episode) {
      const seasonNumber = episode._id.season;
      const episodeNumber = episode._id.episode;
      queries.push(`${baseTitle} S${seasonNumber}E${episodeNumber}`);
      queries.push(`${baseTitle} Season ${seasonNumber} Episode ${episodeNumber}`);
      queries.push(`${baseTitle} ${seasonNumber}x${episodeNumber}`);
      queries.push(`${baseTitle} S${seasonNumber}E${episodeNumber} ${episode.originalTitle}`);
      queries.push(`${baseTitle} "${episode.originalTitle}"`);
      queries.push(`${baseTitle} - ${episode.originalTitle}`);
      queries.push(`${baseTitle} ${title.startYear} S${seasonNumber}E${episodeNumber}`);
    } else {
      queries.push(`${baseTitle} ${title.startYear}`);
      queries.push(`${baseTitle} (${title.startYear})`);
      queries.push(baseTitle);
    }
    return [...new Set(queries)];
  }
}
