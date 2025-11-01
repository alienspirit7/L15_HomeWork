import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppState,
  Distributions,
  Point,
  KMeansResult,
  ClusterComparisonSummary,
  ClusterMetricsSummary,
} from './types';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Statistics } from './components/Statistics';
import { Notification } from './components/Notification';
import { generateGaussianDistributions } from './utils/distribution';
import { runKMeansClientSide } from './utils/kmeans';
import { calculateEuclideanDistance, calculateClusterMetrics } from './utils/math';

const CLUSTER_FORM_LABELS = ['Circle', 'Square', 'Triangle', 'Rhombus'];

const formatMetric = (value: number): string => value.toFixed(3);

const buildClusterComparison = (
  baselineResult: KMeansResult,
  baselineMetrics: ClusterMetricsSummary,
  alternativeResult: KMeansResult,
  alternativeMetrics: ClusterMetricsSummary
): ClusterComparisonSummary => {
  const baselineScore = baselineMetrics.score;
  const alternativeScore = alternativeMetrics.score;
  const EPS = 1e-3;
  const baselineIntra = baselineMetrics.averageIntraDistance;
  const alternativeIntra = alternativeMetrics.averageIntraDistance;
  const baselineInter = baselineMetrics.averageInterCentroidDistance;
  const alternativeInter = alternativeMetrics.averageInterCentroidDistance;

  const intraDescriptor = alternativeIntra < baselineIntra
    ? `tightens clusters (${formatMetric(baselineIntra)} → ${formatMetric(alternativeIntra)})`
    : `loosens clusters (${formatMetric(baselineIntra)} → ${formatMetric(alternativeIntra)})`;

  const interDescriptor = alternativeInter > baselineInter
    ? `widens centroid separation (${formatMetric(baselineInter)} → ${formatMetric(alternativeInter)})`
    : `narrows centroid separation (${formatMetric(baselineInter)} → ${formatMetric(alternativeInter)})`;

  const summaryLine = `Avg intra distance — k=${baselineResult.k}: ${formatMetric(baselineIntra)}, k=${alternativeResult.k}: ${formatMetric(alternativeIntra)}. Avg centroid separation — k=${baselineResult.k}: ${formatMetric(baselineInter)}, k=${alternativeResult.k}: ${formatMetric(alternativeInter)}.`;

  let recommendedK = baselineResult.k;
  let explanation: string;

  if (alternativeScore - baselineScore > EPS) {
    recommendedK = alternativeResult.k;
    explanation = `k=${alternativeResult.k} is recommended: its separation-to-compactness score (${formatMetric(alternativeScore)}) exceeds k=${baselineResult.k} (${formatMetric(baselineScore)}). It ${intraDescriptor}, and while it ${interDescriptor}, the gain in cluster tightness dominates, so the overall ratio improves. ${summaryLine}`;
  } else if (baselineScore - alternativeScore > EPS) {
    recommendedK = baselineResult.k;
    const intraBaselineDescriptor = baselineIntra <= alternativeIntra
      ? `keeps clusters tighter (${formatMetric(baselineIntra)} vs ${formatMetric(alternativeIntra)})`
      : `allows looser clusters (${formatMetric(baselineIntra)} vs ${formatMetric(alternativeIntra)})`;
    const interBaselineDescriptor = baselineInter >= alternativeInter
      ? `keeps centroid separation wider (${formatMetric(baselineInter)} vs ${formatMetric(alternativeInter)})`
      : `narrows centroid separation (${formatMetric(baselineInter)} vs ${formatMetric(alternativeInter)})`;
    explanation = `Stick with k=${baselineResult.k}: its score (${formatMetric(baselineScore)}) beats k=${alternativeResult.k} (${formatMetric(alternativeScore)}), and it ${intraBaselineDescriptor} while it ${interBaselineDescriptor}, yielding the better balance between separation and compactness. ${summaryLine}`;
  } else {
    recommendedK = baselineResult.k;
    explanation = `k=${baselineResult.k} and k=${alternativeResult.k} perform similarly (scores ${formatMetric(baselineScore)} vs ${formatMetric(alternativeScore)}). ${summaryLine}`;
  }

  return {
    baselineK: baselineResult.k,
    alternativeK: alternativeResult.k,
    baselineMetrics,
    alternativeMetrics,
    recommendedK,
    explanation,
  };
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // User inputs
  const [sampleSize, setSampleSize] = useState<string>('200');

  // Data
  const [distributions, setDistributions] = useState<Distributions>({});
  const [mainKMeansResult, setMainKMeansResult] = useState<KMeansResult | null>(null);
  const [reclusterKMeansResult, setReclusterKMeansResult] = useState<KMeansResult | null>(null);
  const [mainClusterMetrics, setMainClusterMetrics] = useState<ClusterMetricsSummary | null>(null);
  const [reclusterClusterMetrics, setReclusterClusterMetrics] = useState<ClusterMetricsSummary | null>(null);
  const [clusterComparison, setClusterComparison] = useState<ClusterComparisonSummary | null>(null);

  // Interaction state
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedPointInfo, setSelectedPointInfo] = useState<string | null>(null);
  const distributionsBeforeKMeans = useRef<Distributions>({});
  const [initialOverlap, setInitialOverlap] = useState<number|undefined>();

  const handleBuildDistributions = useCallback(async () => {
    const sizeNum = parseInt(sampleSize, 10);
    if (isNaN(sizeNum) || sizeNum <= 0) {
      alert('Please enter a valid, positive number for sample size.');
      return;
    }
    setIsLoading(true);
    setAppState(AppState.GENERATING_DISTRIBUTIONS);
    setDistributions({});
    setMainKMeansResult(null);
    setReclusterKMeansResult(null);
    setMainClusterMetrics(null);
    setReclusterClusterMetrics(null);
    setClusterComparison(null);
    setSelectedPointInfo(null);
    
    // Use a timeout to allow the UI to update to the "Building..." state
    setTimeout(() => {
      try {
        const result = generateGaussianDistributions(sizeNum);
        const { distributions: newDistributions, actualOverlap } = result;
        setDistributions(newDistributions || {});
        setInitialOverlap(actualOverlap);
        setAppState(AppState.AWAITING_MOVE_SELECTION);
      } catch (error) {
        console.error(error);
        alert('Failed to build distributions. Please check the console.');
        setAppState(AppState.INITIAL);
      }
      setIsLoading(false);
    }, 50); // Short delay
  }, [sampleSize]);

  const handleMoveSelect = (color: string) => {
    setActiveColor(color);
    setAppState(AppState.MOVING_DISTRIBUTION);
    setNotification(`Move the ${color} distribution with arrow keys. Press Enter when done.`);
  };
  
  const handleExplodeSelect = (color: string) => {
    setActiveColor(color);
    setAppState(AppState.EXPLODING_DISTRIBUTION);
    
    const points = distributions[color] as Point[];
    if (!points || points.length === 0) return;
    
    // Find view bounds to keep new placement within a sensible range
    const allPoints: Point[] = Object.values(distributions).flat() as Point[];
    if (allPoints.length === 0) return;
    const xCoords = allPoints.map(p => p.x);
    const yCoords = allPoints.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const bufferRatio = 0.25;
    const expandedMinX = minX - rangeX * bufferRatio;
    const expandedMaxX = maxX + rangeX * bufferRatio;
    const expandedMinY = minY - rangeY * bufferRatio;
    const expandedMaxY = maxY + rangeY * bufferRatio;

    const randomCenter = () => ({
      x: Math.random() * (expandedMaxX - expandedMinX) + expandedMinX,
      y: Math.random() * (expandedMaxY - expandedMinY) + expandedMinY,
    });

    const groups: Point[][] = [[], []];
    points.forEach(point => {
      const idx = Math.random() < 0.5 ? 0 : 1;
      groups[idx].push(point);
    });

    // Ensure both groups have points; if not, split by index.
    if (groups[0].length === 0 || groups[1].length === 0) {
      const half = Math.ceil(points.length / 2);
      groups[0] = points.slice(0, half);
      groups[1] = points.slice(half);
    }

    const transformedGroups = groups.map(group => {
      if (group.length === 0) return [];

      const { sumX, sumY } = group.reduce(
        (acc, point) => ({ sumX: acc.sumX + point.x, sumY: acc.sumY + point.y }),
        { sumX: 0, sumY: 0 }
      );
      const centroid = { x: sumX / group.length, y: sumY / group.length };

      const newCenter = randomCenter();
      const scale =
        Math.random() < 0.5
          ? Math.random() * 0.5 + 0.4 // concentrate cluster
          : Math.random() * 0.7 + 1.0; // enlarge but still cohesive

      const cohesion = Math.random() * 0.3 + 0.85; // tighten points toward centroid

      return group.map(point => {
        const shiftedX = (point.x - centroid.x) * scale * cohesion;
        const shiftedY = (point.y - centroid.y) * scale * cohesion;
        return {
          x: newCenter.x + shiftedX,
          y: newCenter.y + shiftedY,
        };
      });
    });

    const explodedPoints = [...transformedGroups[0], ...transformedGroups[1]];

    setDistributions(prev => ({
      ...prev,
      [color]: explodedPoints,
    }));
    
    setTimeout(() => {
        setAppState(AppState.AWAITING_KMEANS);
        setActiveColor(null);
    }, 500); // give user a moment to see the change
  };

  const handleDefineGroups = useCallback(async () => {
    distributionsBeforeKMeans.current = JSON.parse(JSON.stringify(distributions));
    const allPoints: Point[] = Object.values(distributions).flat() as Point[];
    setIsLoading(true);
    setAppState(AppState.CLUSTERING);
    
    setTimeout(() => {
      try {
        const result = runKMeansClientSide(allPoints, 3);
        const metrics = calculateClusterMetrics(allPoints, result.assignments, result.centroids);
        setMainKMeansResult(result);
        setReclusterKMeansResult(null);
        setMainClusterMetrics(metrics);
        setReclusterClusterMetrics(null);
        setClusterComparison(null);
        setAppState(AppState.KMEANS_COMPLETE);
      } catch (error) {
        console.error(error);
        alert('Failed to run K-Means. Check console.');
        setAppState(AppState.AWAITING_KMEANS);
      }
      setIsLoading(false);
    }, 50);
  }, [distributions]);
  
  const handleRecluster = useCallback(async (k: number) => {
    const allPoints: Point[] = Object.values(distributionsBeforeKMeans.current).flat() as Point[];
    if (allPoints.length === 0) return;
    
    setIsLoading(true);
    setActiveColor(`k${k}`);
    setAppState(AppState.RECLUSTERING);
    
    setTimeout(() => {
      try {
        const result = runKMeansClientSide(allPoints, k);
        const metrics = calculateClusterMetrics(allPoints, result.assignments, result.centroids);
        setReclusterKMeansResult(result);
        setReclusterClusterMetrics(metrics);
        if (mainKMeansResult && mainClusterMetrics) {
          const comparison = buildClusterComparison(
            mainKMeansResult,
            mainClusterMetrics,
            result,
            metrics
          );
          setClusterComparison(comparison);
        } else {
          setClusterComparison(null);
        }
        setDistributions(distributionsBeforeKMeans.current);
        setAppState(AppState.RECLUSTER_COMPLETE);
      } catch (error) {
        console.error(error);
         alert(`Failed to run K-Means for k=${k}. Check console.`);
         setReclusterClusterMetrics(null);
         setClusterComparison(null);
         setAppState(AppState.KMEANS_COMPLETE);
      }
      setIsLoading(false);
      setActiveColor(null);
    }, 50);
  }, [mainKMeansResult, mainClusterMetrics]);

  const handleResetToMainClustering = useCallback(() => {
    if (!mainKMeansResult || !mainClusterMetrics) return;
    setReclusterKMeansResult(null);
    setReclusterClusterMetrics(null);
    setClusterComparison(null);
    setDistributions(distributionsBeforeKMeans.current);
    setAppState(AppState.KMEANS_COMPLETE);
  }, [mainKMeansResult, mainClusterMetrics]);

  const handlePointClick = (point: Point, color: string) => {
    const latestResult = reclusterKMeansResult ?? mainKMeansResult;
    if (!latestResult || !latestResult.centroids || latestResult.centroids.length === 0) {
      setSelectedPointInfo('Run K-Means to view distances to the latest cluster centers.');
      return;
    }

    let closestClusterIndex = 0;
    let smallestDistance = Infinity;
    const distanceLines: string[] = [];

    latestResult.centroids.forEach((centerPoint, index) => {
      const dist = calculateEuclideanDistance(point, centerPoint);
      if (dist < smallestDistance) {
        smallestDistance = dist;
        closestClusterIndex = index;
      }
      const clusterLabel = CLUSTER_FORM_LABELS[index] ?? `Cluster ${index + 1}`;
      distanceLines.push(`  - ${clusterLabel}: ${dist.toFixed(4)}`);
    });

    const assignedLabel = CLUSTER_FORM_LABELS[closestClusterIndex] ?? `Cluster ${closestClusterIndex + 1}`;

    let info = `${assignedLabel} point (${point.x.toFixed(2)}, ${point.y.toFixed(2)}) originally from ${color} group.\n`;
    info += `Euclidean distances to latest cluster centers (k=${latestResult.k}):\n`;
    info += distanceLines.join('\n');
    info += '\n';
    setSelectedPointInfo(info);
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState !== AppState.MOVING_DISTRIBUTION || !activeColor) return;
      
      const moveStep = 0.2;
      let dx = 0, dy = 0;

      switch (e.key) {
        case 'ArrowUp': dy = -moveStep; break;
        case 'ArrowDown': dy = moveStep; break;
        case 'ArrowLeft': dx = -moveStep; break;
        case 'ArrowRight': dx = moveStep; break;
        case 'Enter':
          e.preventDefault();
          setAppState(AppState.AWAITING_EXPLODE_SELECTION);
          setActiveColor(null);
          setNotification(null);
          return;
        default:
          return;
      }
      
      e.preventDefault();

      setDistributions(prev => {
        if (!prev[activeColor]) return prev; // Guard against missing distribution
        const newDist = [...prev[activeColor]].map(p => ({ x: p.x + dx, y: p.y + dy }));
        return { ...prev, [activeColor]: newDist };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, activeColor]);


  return (
    <div className="min-h-screen flex flex-col p-4 gap-4 bg-gray-900 font-sans relative">
      <Notification message={notification} />
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300">Interactive Gaussian Distribution & K-Means Clustering</h1>
        <p className="text-gray-400 mt-2">Generate, manipulate, and analyze clustered data points.</p>
      </header>

      <main className="flex-grow flex flex-col md:flex-row gap-4">
        <div className="md:w-1/4 flex flex-col gap-4">
          <Controls 
            appState={appState}
            sampleSize={sampleSize}
            setSampleSize={setSampleSize}
            onBuild={handleBuildDistributions}
            onMoveSelect={handleMoveSelect}
            onExplodeSelect={handleExplodeSelect}
            onDefineGroups={handleDefineGroups}
            onRecluster={handleRecluster}
            onResetToMainClustering={handleResetToMainClustering}
            activeColor={activeColor}
            isLoading={isLoading}
          />
          <Statistics 
            initialOverlap={initialOverlap}
            sampleSize={parseInt(sampleSize) || undefined}
            mainKMeansResult={mainKMeansResult}
            reclusterKMeansResult={reclusterKMeansResult}
            mainClusterMetrics={mainClusterMetrics}
            reclusterClusterMetrics={reclusterClusterMetrics}
            clusterComparison={clusterComparison}
          />
           {selectedPointInfo && (
            <div className="bg-gray-800 p-4 rounded-lg shadow-inner space-y-2">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-cyan-400">Point Details</h3>
                 <button onClick={() => setSelectedPointInfo(null)} className="text-gray-400 hover:text-white">&times;</button>
              </div>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">{selectedPointInfo}</pre>
            </div>
          )}
        </div>
        <div className="md:w-3/4 min-h-[400px] md:min-h-0">
          <ScatterPlot 
            distributions={distributions}
            kmeansResult={reclusterKMeansResult || mainKMeansResult}
            onPointClick={handlePointClick}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
