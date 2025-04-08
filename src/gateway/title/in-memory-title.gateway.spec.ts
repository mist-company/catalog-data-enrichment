import { Title } from '../../dto/title';
import { IdValueObject } from '../../value-object/id.value-object';
import { InMemoryTitleGateway } from './in-memory-title.gateway';

describe('InMemoryTitleGateway', () => {
  it('inserts a titlte', async () => {
    const titleGateway = new InMemoryTitleGateway();
    const titleId = new IdValueObject('tt000000');
    const title: Title = {
      _id: titleId,
      primaryTitle: 'Test Title',
      originalTitle: 'Test Title Original',
      titleType: 'movie',
      isAdult: false,
      startYear: 2023,
      endYear: null,
      runtimeMinutes: 120,
      genres: ['Drama', 'Action'],
    };
    await titleGateway.insert(title);
    const result = await titleGateway.get({ imdbId: titleId });
    expect(result).toEqual(title);
  });

  it('updates a title', async () => {
    const titleGateway = new InMemoryTitleGateway();
    const titleId = new IdValueObject('tt000000');
    const title: Title = {
      _id: titleId,
      primaryTitle: 'Test Title',
      originalTitle: 'Test Title Original',
      titleType: 'movie',
      isAdult: false,
      startYear: 2023,
      endYear: null,
      runtimeMinutes: 120,
      genres: ['Drama', 'Action'],
    };
    await titleGateway.insert(title);
    const updatedTitle = { ...title, primaryTitle: 'Updated Test Title' };
    await titleGateway.insert(updatedTitle);
    const result = await titleGateway.get({ imdbId: titleId });
    expect(result).toEqual(updatedTitle);
  });

  it('returns null for non-existent title', async () => {
    const titleGateway = new InMemoryTitleGateway();
    const titleId = new IdValueObject('tt000000');
    const result = await titleGateway.get({ imdbId: titleId });
    expect(result).toBeNull();
  });

  it('returns a title with the same id', async () => {
    const titleGateway = new InMemoryTitleGateway();
    const titleId = new IdValueObject('tt000000');
    const title: Title = {
      _id: titleId,
      primaryTitle: 'Test Title',
      originalTitle: 'Test Title Original',
      titleType: 'movie',
      isAdult: false,
      startYear: 2023,
      endYear: null,
      runtimeMinutes: 120,
      genres: ['Drama', 'Action'],
    };
    await titleGateway.insert(title);
    const result = await titleGateway.get({ imdbId: titleId });
    expect(result).toEqual(title);
  });
});
