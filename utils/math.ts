
import { Point, ClusterMetricsSummary } from '../types';

// Euclidean distance between two points.
export const calculateEuclideanDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateClusterMetrics = (
  points: Point[],
  assignments: number[],
  centroids: Point[]
): ClusterMetricsSummary => {
  const clusterCount = centroids.length;
  const clusterDistanceSums = new Array(clusterCount).fill(0);
  const clusterPointCounts = new Array(clusterCount).fill(0);

  let totalDistance = 0;
  let totalAssignedPoints = 0;

  assignments.forEach((clusterIndex, index) => {
    if (
      clusterIndex === undefined ||
      clusterIndex < 0 ||
      clusterIndex >= clusterCount
    ) {
      return;
    }
    const centroid = centroids[clusterIndex];
    const point = points[index];
    if (!centroid || !point) return;

    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    clusterDistanceSums[clusterIndex] += distance;
    clusterPointCounts[clusterIndex] += 1;
    totalDistance += distance;
    totalAssignedPoints += 1;
  });

  const clusterAverageDistances = clusterDistanceSums.map((sum, idx) => {
    const count = clusterPointCounts[idx];
    return count > 0 ? sum / count : 0;
  });

  const averageIntraDistance =
    totalAssignedPoints > 0 ? totalDistance / totalAssignedPoints : 0;

  let minInterCentroidDistance = Infinity;
  let interDistanceSum = 0;
  let centroidPairs = 0;

  for (let i = 0; i < clusterCount; i++) {
    for (let j = i + 1; j < clusterCount; j++) {
      const distance = calculateEuclideanDistance(centroids[i], centroids[j]);
      interDistanceSum += distance;
      centroidPairs += 1;
      if (distance < minInterCentroidDistance) {
        minInterCentroidDistance = distance;
      }
    }
  }

  const averageInterCentroidDistance =
    centroidPairs > 0 ? interDistanceSum / centroidPairs : 0;

  const score =
    averageIntraDistance > 0
      ? averageInterCentroidDistance / averageIntraDistance
      : 0;

  return {
    averageIntraDistance,
    averageInterCentroidDistance,
    minInterCentroidDistance:
      Number.isFinite(minInterCentroidDistance) && centroidPairs > 0
        ? minInterCentroidDistance
        : 0,
    clusterAverageDistances,
    score,
  };
};
