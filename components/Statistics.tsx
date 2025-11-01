
import React from 'react';
import {
  KMeansResult,
  ClusterMetricsSummary,
  ClusterComparisonSummary,
} from '../types';

interface StatisticsProps {
  initialOverlap?: number;
  sampleSize?: number;
  mainKMeansResult?: KMeansResult;
  reclusterKMeansResult?: KMeansResult;
  mainClusterMetrics?: ClusterMetricsSummary | null;
  reclusterClusterMetrics?: ClusterMetricsSummary | null;
  clusterComparison?: ClusterComparisonSummary | null;
}

const formatMetric = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(3);
};

export const Statistics: React.FC<StatisticsProps> = ({
  initialOverlap,
  sampleSize,
  mainKMeansResult,
  reclusterKMeansResult,
  mainClusterMetrics,
  reclusterClusterMetrics,
  clusterComparison,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-inner space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 border-b border-gray-600 pb-2">Statistics</h3>
      
      {(initialOverlap !== undefined && sampleSize !== undefined) && (
        <div className="text-sm">
          <p><span className="font-semibold">Initial Sample Size/Group:</span> {sampleSize}</p>
          <p><span className="font-semibold">Initial Overlap:</span> {initialOverlap.toFixed(1)}%</p>
        </div>
      )}

      {mainKMeansResult && (
        <div>
          <h4 className="font-semibold text-lg text-green-400">K-Means (k={mainKMeansResult.k})</h4>
          <p className="text-sm"><span className="font-semibold">Iterations:</span> {mainKMeansResult.iterations}</p>
          <p className="text-sm"><span className="font-semibold">Sum of Squared Errors (SSE):</span> {mainKMeansResult.sse.toFixed(2)}</p>
          {mainClusterMetrics && (
            <div className="text-xs text-gray-300 mt-2 space-y-1">
              <p>Avg intra distance: {formatMetric(mainClusterMetrics.averageIntraDistance)}</p>
              <p>Avg centroid separation: {formatMetric(mainClusterMetrics.averageInterCentroidDistance)}</p>
              <p>Min centroid separation: {formatMetric(mainClusterMetrics.minInterCentroidDistance)}</p>
              <p>Score (separation / intra): {formatMetric(mainClusterMetrics.score)}</p>
            </div>
          )}
        </div>
      )}

      {reclusterKMeansResult && (
        <div>
          <h4 className="font-semibold text-lg text-purple-400">Comparison (k={reclusterKMeansResult.k})</h4>
          <p className="text-sm"><span className="font-semibold">Iterations:</span> {reclusterKMeansResult.iterations}</p>
          <p className="text-sm"><span className="font-semibold">Sum of Squared Errors (SSE):</span> {reclusterKMeansResult.sse.toFixed(2)}</p>
          {mainKMeansResult && (
             <p className={`text-sm mt-1 font-bold ${reclusterKMeansResult.sse < mainKMeansResult.sse ? 'text-green-500' : 'text-red-500'}`}>
               SSE is {reclusterKMeansResult.sse < mainKMeansResult.sse ? 'lower' : 'higher'} than with k=3.
            </p>
          )}
          {reclusterClusterMetrics && (
            <div className="text-xs text-gray-300 mt-2 space-y-1">
              <p>Avg intra distance: {formatMetric(reclusterClusterMetrics.averageIntraDistance)}</p>
              <p>Avg centroid separation: {formatMetric(reclusterClusterMetrics.averageInterCentroidDistance)}</p>
              <p>Min centroid separation: {formatMetric(reclusterClusterMetrics.minInterCentroidDistance)}</p>
              <p>Score (separation / intra): {formatMetric(reclusterClusterMetrics.score)}</p>
            </div>
          )}
        </div>
      )}

      {clusterComparison && (
        <div className="text-sm text-gray-200 border-t border-gray-700 pt-3 space-y-2">
          <h4 className="font-semibold text-lg text-amber-400">Recommendation</h4>
          <p>
            <span className="font-semibold text-white">Best split:</span>{' '}
            k={clusterComparison.recommendedK}. {clusterComparison.explanation}
          </p>
          <div className="bg-gray-900 border border-gray-700 rounded-md p-3 text-xs space-y-2">
            <div>
              <p className="font-semibold text-green-400">k={clusterComparison.baselineK}</p>
              <p>Avg intra distance: {formatMetric(clusterComparison.baselineMetrics.averageIntraDistance)}</p>
              <p>Avg centroid separation: {formatMetric(clusterComparison.baselineMetrics.averageInterCentroidDistance)}</p>
              <p>Score: {formatMetric(clusterComparison.baselineMetrics.score)}</p>
            </div>
            <div>
              <p className="font-semibold text-purple-400">k={clusterComparison.alternativeK}</p>
              <p>Avg intra distance: {formatMetric(clusterComparison.alternativeMetrics.averageIntraDistance)}</p>
              <p>Avg centroid separation: {formatMetric(clusterComparison.alternativeMetrics.averageInterCentroidDistance)}</p>
              <p>Score: {formatMetric(clusterComparison.alternativeMetrics.score)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
