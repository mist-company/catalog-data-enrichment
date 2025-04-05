import { TitleIdValueObject } from '../value-object/title-id.vo';

export interface Title {
  _id: TitleIdValueObject;
  endYear: number | null;
  genres: string[];
  isAdult: boolean;
  originalTitle: string;
  primaryTitle: string;
  runtimeMinutes: number | null;
  startYear: number;
  titleType: string;
}
