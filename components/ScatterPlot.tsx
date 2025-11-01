
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
  const { allPoints, bounds, width, height } = useMemo(() => {
    const points: PlotPoint[] = [];
    Object.entries(distributions).forEach(([color, dist]) => {
      if (Array.isArray(dist)) {
        (dist as Point[]).forEach(p => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number' && isFinite(p.x) && isFinite(p.y)) {
            points.push({ ...p, color });
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

    if (points.length === 0) {
      return { allPoints: [], bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 }, width: 20, height: 20 };
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
    
    return { allPoints: points, bounds, width, height };
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
      </svg>
      )}
    </div>
  );
};
