export interface Title {
  _id: string;
  endYear: number | null;
  genres: string[];
  isAdult: boolean;
  originalTitle: string;
  primaryTitle: string;
  runtimeMinutes: number | null;
  startYear: number;
  titleType: string;
}
