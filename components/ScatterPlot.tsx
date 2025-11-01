
import React, { useMemo } from 'react';
import { Distributions, Point, DISTRIBUTION_COLORS, KMeansResult } from '../types';

interface ScatterPlotProps {
  distributions: Distributions;
  kmeansResult?: KMeansResult | null;
  onPointClick: (point: Point, color: string) => void;
}

interface PlotPoint {
  x: number;
  y: number;
  color: string;
  cluster?: number;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ distributions, kmeansResult, onPointClick }) => {
  const { allPoints, bounds, width, height, distributionCentroids, kMeansCentroids } = useMemo(() => {
    const points: PlotPoint[] = [];
    const centroidSums: Record<string, { sumX: number; sumY: number; count: number }> = {};
    Object.entries(distributions).forEach(([color, dist]) => {
      centroidSums[color] = { sumX: 0, sumY: 0, count: 0 };
      if (Array.isArray(dist)) {
        (dist as Point[]).forEach(p => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number' && isFinite(p.x) && isFinite(p.y)) {
            points.push({ ...p, color });
            centroidSums[color].sumX += p.x;
            centroidSums[color].sumY += p.y;
            centroidSums[color].count += 1;
          }
        });
      }
    });

    if (kmeansResult && kmeansResult.assignments.length > 0) {
      const validPointsWithOriginalIndex = points.map((p, i) => ({...p, originalIndex: i}));
      if (kmeansResult.assignments.length === validPointsWithOriginalIndex.length) {
         points.forEach((p, i) => {
            p.cluster = kmeansResult.assignments[i];
         });
      }
    }

    const distributionCentroids: Record<string, Point> = {};
    Object.entries(centroidSums).forEach(([color, { sumX, sumY, count }]) => {
      if (count > 0) {
        distributionCentroids[color] = { x: sumX / count, y: sumY / count };
      }
    });

    const kMeansCentroids = kmeansResult?.centroids ?? [];

    if (points.length === 0) {
      return {
        allPoints: [],
        bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 },
        width: 20,
        height: 20,
        distributionCentroids,
        kMeansCentroids,
      };
    }

    const xCoords = points.map(p => p.x);
    const yCoords = points.map(p => p.y);
    let minX = Math.min(...xCoords);
    let maxX = Math.max(...xCoords);
    let minY = Math.min(...yCoords);
    let maxY = Math.max(...yCoords);
    
    if (minX === maxX) {
      minX -= 1;
      maxX += 1;
    }
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }
    
    const padding = Math.max(maxX - minX, maxY - minY) * 0.1;

    const bounds = {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    };
    
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    return { allPoints: points, bounds, width, height, distributionCentroids, kMeansCentroids };
  }, [distributions, kmeansResult]);

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg p-4 relative overflow-hidden">
      {allPoints.length === 0 ? (
         <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Please build distributions to begin.</p>
         </div>
      ) : (
      <svg viewBox={`${bounds.minX} ${bounds.minY} ${width} ${height}`} className="w-full h-full">
        <rect x={bounds.minX} y={bounds.minY} width={width} height={height} fill="#2d3748" />

        {allPoints.map((p, i) => {
            const shapeSize = width / 125;
            const fill = p.color ? DISTRIBUTION_COLORS[p.color] : '#ffffff';
            const commonProps = {
              fill: fill,
              fillOpacity: "0.8",
            };

            let shapeElement;
            const cluster = p.cluster;

            if (cluster === undefined) {
              // Default shape for un-clustered points
              shapeElement = <circle cx={p.x} cy={p.y} r={shapeSize / 3} {...commonProps} />;
            } else {
              switch (cluster) {
                case 0: // Ball
                  shapeElement = <circle cx={p.x} cy={p.y} r={shapeSize / 2} {...commonProps} />;
                  break;
                case 1: // Square
                  shapeElement = <rect x={p.x - shapeSize / 2} y={p.y - shapeSize / 2} width={shapeSize} height={shapeSize} {...commonProps} />;
                  break;
                case 2: // Triangle
                  const triPoints = `${p.x},${p.y - shapeSize/2} ${p.x - shapeSize/2},${p.y + shapeSize/2} ${p.x + shapeSize/2},${p.y + shapeSize/2}`;
                  shapeElement = <polygon points={triPoints} {...commonProps} />;
                  break;
                case 3: // Rhombus
                  const rhomPoints = `${p.x},${p.y - shapeSize/2} ${p.x + shapeSize/2},${p.y} ${p.x},${p.y + shapeSize/2} ${p.x - shapeSize/2},${p.y}`;
                  shapeElement = <polygon points={rhomPoints} {...commonProps} />;
                  break;
                default: // Fallback to circle
                  shapeElement = <circle cx={p.x} cy={p.y} r={shapeSize / 2} {...commonProps} />;
                  break;
              }
            }
            return (
              <g key={i} onClick={() => onPointClick(p, p.color)} className="cursor-pointer">
                {shapeElement}
              </g>
            );
        })}

        {Object.entries(distributionCentroids).map(([color, centroid]) => {
          const markerSize = width / 50;
          return (
            <g key={`centroid-${color}`}>
              <circle
                cx={centroid.x}
                cy={centroid.y}
                r={markerSize / 2}
                fill="#ffffff"
                stroke={DISTRIBUTION_COLORS[color]}
                strokeWidth={markerSize / 4}
              />
              <line
                x1={centroid.x - markerSize}
                y1={centroid.y}
                x2={centroid.x + markerSize}
                y2={centroid.y}
                stroke={DISTRIBUTION_COLORS[color]}
                strokeWidth={markerSize / 6}
              />
              <line
                x1={centroid.x}
                y1={centroid.y - markerSize}
                x2={centroid.x}
                y2={centroid.y + markerSize}
                stroke={DISTRIBUTION_COLORS[color]}
                strokeWidth={markerSize / 6}
              />
              <text
                x={centroid.x + markerSize * 0.8}
                y={centroid.y - markerSize * 0.8}
                fill={DISTRIBUTION_COLORS[color]}
                fontSize={markerSize}
                fontWeight="bold"
              >
                {color.toUpperCase()}
              </text>
            </g>
          );
        })}

        {kMeansCentroids.map((centroid, index) => {
          if (!centroid) return null;
          const markerSize = width / 60;
          const colors = ['#22c55e', '#000000', '#a855f7', '#06b6d4'];
          const stroke = colors[index % colors.length];
          return (
            <g key={`kmeans-centroid-${index}`}>
              <rect
                x={centroid.x - markerSize / 2}
                y={centroid.y - markerSize / 2}
                width={markerSize}
                height={markerSize}
                fill="none"
                stroke={stroke}
                strokeWidth={markerSize / 6}
              />
              <text
                x={centroid.x + markerSize}
                y={centroid.y - markerSize}
                fill={stroke}
                fontSize={markerSize * 0.8}
                fontWeight="bold"
              >
                {`K${index + 1}`}
              </text>
            </g>
          );
        })}
      </svg>
      )}
    </div>
  );
};
