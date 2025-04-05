import { container } from 'tsyringe';
import { FindTorrentsUseCase } from './find-torrents.use-case';
import { InMemoryTorrentGateway } from '../gateway/torrent/in-memory-torrent.gateway';
import { InMemoryTitleGateway } from '../gateway/title/in-memory-title.gateway';
import { Title } from '../dto/title';
import { TitleIdValueObject } from '../value-object/title-id.vo';

function makeSut() {
  const logger = { child: jest.fn(), debug: jest.fn(), info: jest.fn() };
  logger.child.mockReturnValue({ ...logger });
  const titleGateway = new InMemoryTitleGateway();
  const torrentGateway = new InMemoryTorrentGateway();
  const sut = container
    .register('LoggerHelper', { useValue: logger })
    .register('TitleGateway', { useValue: titleGateway })
    .register('TorrentGateway', { useValue: torrentGateway })
    .register('SearchableTorrentGateway', { useValue: torrentGateway })
    .resolve(FindTorrentsUseCase);
  return { sut, logger, titleGateway, torrentGateway };
}

describe('FindTorrentsUseCase', () => {
  it('is defined', () => {
    const { sut } = makeSut();
    expect(sut).toBeDefined();
  });

  it('calls titleGateway.get with the correct params', async () => {
    const titleGatewayGetSpy = jest.spyOn(InMemoryTitleGateway.prototype, 'get');
    const { sut } = makeSut();
    const movieId = new TitleIdValueObject('tt0000000');
    const tvSeriesId = new TitleIdValueObject('tt0000001:1:1');
    await sut.execute({ imdbId: 'tt0000000' });
    expect(titleGatewayGetSpy).toHaveBeenCalledWith({ imdbId: movieId });
    await sut.execute({ imdbId: 'tt0000001:1:1' });
    expect(titleGatewayGetSpy).toHaveBeenCalledWith({ imdbId: tvSeriesId });
  });

  it('returns an empty array if title is not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({ imdbId: 'tt0000000' });
    expect(result).toEqual([]);
  });

  it('returns an empty array if no torrents are found', async () => {
    jest.spyOn(InMemoryTorrentGateway.prototype, 'search').mockResolvedValueOnce([]);
    const { sut, titleGateway } = makeSut();
    const titleId = new TitleIdValueObject('tt0000000');
    titleGateway.insert({
      _id: titleId,
      titleType: 'movie',
      primaryTitle: 'Some Movie',
      startYear: 2015,
    } as Title);
    const result = await sut.execute({ imdbId: 'tt0000000' });
    expect(result).toEqual([]);
  });

  it('calls searchableTorrentGateway.search with the correct params for movies', async () => {
    const torrentGatewaySearchSpy = jest.spyOn(InMemoryTorrentGateway.prototype, 'search');
    const { sut, titleGateway } = makeSut();
    const titleId = new TitleIdValueObject('tt0000000');
    titleGateway.insert({
      _id: titleId,
      titleType: 'movie',
      primaryTitle: 'Some Movie',
      startYear: 2015,
    } as Title);
    await sut.execute({ imdbId: 'tt0000000' });
    expect(torrentGatewaySearchSpy).toHaveBeenCalledWith('Some Movie 2015', 'MOVIE');
  });

  it('calls searchableTorrentGateway.search with the correct params for tv series', async () => {
    const torrentGatewaySearchSpy = jest.spyOn(InMemoryTorrentGateway.prototype, 'search');
    const { sut, titleGateway } = makeSut();
    const titleId = new TitleIdValueObject('tt0000000:1:1');
    titleGateway.insert({
      _id: titleId,
      titleType: 'tvSeries',
      primaryTitle: 'Some TV Series',
      startYear: 2015,
    } as Title);
    await sut.execute({ imdbId: 'tt0000000:1:1' });
    expect(torrentGatewaySearchSpy).toHaveBeenCalledWith('Some TV Series S01 E01', 'TV_SERIES');
  });
});
