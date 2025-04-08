import { IdValueObject } from './id.value-object';

describe('IdValueObject', () => {
  it('desconstructs if is a serie id', () => {
    const titleId = new IdValueObject('tt000000:1:2');
    expect(titleId.id).toBe('tt000000');
    expect(titleId.season).toBe('01');
    expect(titleId.episode).toBe('02');
    expect(titleId.toString()).toBe('tt000000:1:2');
  });

  it('desconstructs if is a serie id with two digits', () => {
    const titleId = new IdValueObject('tt000000:01:02');
    expect(titleId.id).toBe('tt000000');
    expect(titleId.season).toBe('01');
    expect(titleId.episode).toBe('02');
    expect(titleId.toString()).toBe('tt000000:01:02');
  });

  it('desconstructs if is a serie id with three digits', () => {
    const titleId = new IdValueObject('tt000000:001:002');
    expect(titleId.id).toBe('tt000000');
    expect(titleId.season).toBe('001');
    expect(titleId.episode).toBe('002');
    expect(titleId.toString()).toBe('tt000000:001:002');
  });

  it('does not desconstruct if is a movie id', () => {
    const titleId = new IdValueObject('tt000000');
    expect(titleId.id).toBe('tt000000');
    expect(titleId.season).toBeUndefined();
    expect(titleId.episode).toBeUndefined();
    expect(titleId.toString()).toBe('tt000000');
  });

  it('compares two title ids', () => {
    const titleId1 = new IdValueObject('tt000001:1:2');
    const titleId2 = new IdValueObject('tt000002:1:2');
    const titleId3 = new IdValueObject('tt000003:1:2');
    expect(titleId1.isEqual(titleId1)).toBe(true);
    expect(titleId1.isEqual(titleId2)).toBe(false);
    expect(titleId1.isEqual(titleId3)).toBe(false);
  });
});
