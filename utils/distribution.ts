import { Point, Distribution, Distributions, Centroids } from '../types';
import { calculateEuclideanDistance } from './math';

// Box-Muller transform to generate a pair of standard normal random variables (mean 0, std dev 1)
const boxMullerTransform = (): [number, number] => {
  let u1 = 0, u2 = 0;
  // Prevent u1 from being 0 to avoid issues with log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const R = Math.sqrt(-2.0 * Math.log(u1));
  const theta = 2.0 * Math.PI * u2;

  return [R * Math.cos(theta), R * Math.sin(theta)];
};

const generateSingleGaussian = (mean: Point, stdDev: number, size: number): Distribution => {
  const distribution: Distribution = [];
  for (let i = 0; i < Math.ceil(size / 2); i++) {
    const [z1, z2] = boxMullerTransform();
    distribution.push({ x: mean.x + z1 * stdDev, y: mean.y + z2 * stdDev });
    // Add the second point from the same transform
    distribution.push({ x: mean.x + z2 * stdDev, y: mean.y + z1 * stdDev });
  }
  // Ensure the distribution has the exact requested size
  return distribution.slice(0, size);
};

interface GenerationResponse {
  distributions: Distributions;
  initialCentroids: Centroids;
  actualOverlap: number;
}

const calculateOverlapPercentage = (
  distributions: Distributions,
  centroids: Centroids
): number => {
  const colors = Object.keys(distributions);
  if (colors.length < 2) {
    return 0;
  }

  let crossoverPoints = 0;
  let totalPoints = 0;

  colors.forEach(color => {
    const points = distributions[color] || [];
    points.forEach(point => {
      totalPoints += 1;
      let nearestColor: string | null = null;
      let nearestDistance = Infinity;
      Object.entries(centroids).forEach(([centroidColor, centroidPoint]) => {
        const distance = calculateEuclideanDistance(point, centroidPoint);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestColor = centroidColor;
        }
      });
      if (nearestColor && nearestColor !== color) {
        crossoverPoints += 1;
      }
    });
  });

  return totalPoints > 0 ? (crossoverPoints / totalPoints) * 100 : 0;
};

export const generateGaussianDistributions = (sampleSize: number): GenerationResponse => {
  const stdDev = 1.8; // Tuned for visual overlap to be around 30%
  const centroids: Centroids = {
    // Positioned as vertices of an equilateral triangle for balanced overlap
    blue: { x: 2.5, y: 0 },
    red: { x: -1.25, y: 2.16 },
    orange: { x: -1.25, y: -2.16 },
  };

  const distributions: Distributions = {
    blue: generateSingleGaussian(centroids.blue, stdDev, sampleSize),
    red: generateSingleGaussian(centroids.red, stdDev, sampleSize),
    orange: generateSingleGaussian(centroids.orange, stdDev, sampleSize),
  };

  const actualOverlap = calculateOverlapPercentage(distributions, centroids);

  return {
    distributions,
    initialCentroids: centroids,
    actualOverlap,
  };
};
