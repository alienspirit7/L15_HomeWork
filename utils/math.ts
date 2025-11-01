
import { Point } from './types';

export const calculateCosineDistance = (p1: Point, p2: Point): number => {
  const dotProduct = p1.x * p2.x + p1.y * p2.y;
  const magnitude1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
  const magnitude2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 1; // Distance is 1 if one vector is zero
  }

  const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);
  
  // Cosine distance is 1 - cosine similarity
  return 1 - cosineSimilarity;
};
