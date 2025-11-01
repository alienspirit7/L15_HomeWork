
export interface Point {
  x: number;
  y: number;
}

export type Distribution = Point[];
export type Distributions = Record<string, Distribution>;
export type Centroids = Record<string, Point>;

export enum AppState {
  INITIAL,
  GENERATING_DISTRIBUTIONS,
  AWAITING_MOVE_SELECTION,
  MOVING_DISTRIBUTION,
  AWAITING_EXPLODE_SELECTION,
  EXPLODING_DISTRIBUTION,
  AWAITING_KMEANS,
  CLUSTERING,
  KMEANS_COMPLETE,
  RECLUSTERING,
  RECLUSTER_COMPLETE,
}

export interface KMeansResult {
  assignments: number[];
  centroids: Point[];
  iterations: number;
  sse: number;
  k: number;
}

export const DISTRIBUTION_COLORS: Record<string, string> = {
  blue: '#3b82f6',   // tailwind blue-500
  red: '#ef4444',    // tailwind red-500
  orange: '#f97316', // tailwind orange-500
};

export const CLUSTER_COLORS: string[] = [
  '#22c55e', // green-500
  '#000000', // black
  '#a855f7', // purple-500
  '#06b6d4', // cyan-500
];

export interface ClusterMetricsSummary {
  averageIntraDistance: number;
  averageInterCentroidDistance: number;
  minInterCentroidDistance: number;
  clusterAverageDistances: number[];
  score: number;
}

export interface ClusterComparisonSummary {
  baselineK: number;
  alternativeK: number;
  baselineMetrics: ClusterMetricsSummary;
  alternativeMetrics: ClusterMetricsSummary;
  recommendedK: number;
  explanation: string;
}
