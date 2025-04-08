import { IdValueObject } from '../value-object/id.value-object';

export interface Title {
  _id: IdValueObject;
  endYear: number | null;
  genres: string[];
  isAdult: boolean;
  originalTitle: string;
  primaryTitle: string;
  runtimeMinutes: number | null;
  startYear: number;
  titleType: string;
}
