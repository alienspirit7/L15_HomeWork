import { Point, KMeansResult } from '../types';

const euclideanDistanceSq = (p1: Point, p2: Point): number => {
  // Using squared distance is faster for comparison as it avoids Math.sqrt
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
};

const MAX_ITERATIONS = 100;

export const runKMeansClientSide = (points: Point[], k: number): KMeansResult => {
  if (points.length < k) {
    throw new Error("Cannot run K-Means: number of points is less than k.");
  }
  // 1. Initialization: Select k unique points randomly from the dataset
  let centroids: Point[] = [];
  const usedIndices = new Set<number>();
  while (centroids.length < k) {
    const randomIndex = Math.floor(Math.random() * points.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      centroids.push(points[randomIndex]);
    }
  }

  let assignments: number[] = new Array(points.length).fill(-1);
  let iterations = 0;
  let hasConverged = false;

  while (iterations < MAX_ITERATIONS && !hasConverged) {
    // 2. Assignment Step
    const newAssignments = points.map(point => {
      let minDistanceSq = Infinity;
      let clusterIndex = -1;
      centroids.forEach((centroid, index) => {
        const distanceSq = euclideanDistanceSq(point, centroid);
        if (distanceSq < minDistanceSq) {
          minDistanceSq = distanceSq;
          clusterIndex = index;
        }
      });
      return clusterIndex;
    });

    // Convergence Check: See if any assignments changed
    hasConverged = newAssignments.every((val, index) => val === assignments[index]);
    if (hasConverged) {
        iterations++;
        break;
    }
    assignments = newAssignments;

    // 3. Update Step: Recalculate centroids
    const newCentroids: Point[] = new Array(k).fill(null).map(() => ({ x: 0, y: 0 }));
    const clusterCounts: number[] = new Array(k).fill(0);

    points.forEach((point, index) => {
      const clusterIndex = assignments[index];
      newCentroids[clusterIndex].x += point.x;
      newCentroids[clusterIndex].y += point.y;
      clusterCounts[clusterIndex]++;
    });

    for (let i = 0; i < k; i++) {
      if (clusterCounts[i] > 0) {
        newCentroids[i].x /= clusterCounts[i];
        newCentroids[i].y /= clusterCounts[i];
      } else {
        // Handle empty cluster: re-initialize centroid to a random point
        // to prevent it from disappearing.
        const randomIndex = Math.floor(Math.random() * points.length);
        newCentroids[i] = points[randomIndex];
      }
    }
    centroids = newCentroids;
    iterations++;
  }

  // 4. Calculate final Sum of Squared Errors (SSE)
  let sse = 0;
  points.forEach((point, index) => {
    const clusterIndex = assignments[index];
    if (clusterIndex !== -1) {
      const centroid = centroids[clusterIndex];
      sse += euclideanDistanceSq(point, centroid);
    }
  });

  return {
    assignments,
    centroids,
    iterations,
    sse,
    k,
  };
};
