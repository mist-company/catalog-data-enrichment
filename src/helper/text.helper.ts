import { distance } from 'fastest-levenshtein';

export class TextHelper {
  static calcSimilarity(textA: string, textB: string): number {
    const distanceScore = distance(textA, textB);
    const maxLength = Math.max(textA.length, textB.length);
    const similarityScore = 1 - distanceScore / maxLength;
    return similarityScore;
  }
}
