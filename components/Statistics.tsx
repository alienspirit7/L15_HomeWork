
import React from 'react';
import { KMeansResult } from '../types';

interface StatisticsProps {
  initialOverlap?: number;
  sampleSize?: number;
  mainKMeansResult?: KMeansResult;
  reclusterKMeansResult?: KMeansResult;
}

export const Statistics: React.FC<StatisticsProps> = ({ initialOverlap, sampleSize, mainKMeansResult, reclusterKMeansResult }) => {
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
        </div>
      )}
    </div>
  );
};
