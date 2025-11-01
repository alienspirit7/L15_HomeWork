import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Distributions, Point, KMeansResult } from './types';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Statistics } from './components/Statistics';
import { Notification } from './components/Notification';
import { generateGaussianDistributions } from './utils/distribution';
import { runKMeansClientSide } from './utils/kmeans';
import { calculateEuclideanDistance } from './utils/math';

const CLUSTER_FORM_LABELS = ['Circle', 'Square', 'Triangle', 'Rhombus'];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // User inputs
  const [sampleSize, setSampleSize] = useState<string>('200');

  // Data
  const [distributions, setDistributions] = useState<Distributions>({});
  const [mainKMeansResult, setMainKMeansResult] = useState<KMeansResult | null>(null);
  const [reclusterKMeansResult, setReclusterKMeansResult] = useState<KMeansResult | null>(null);

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

    // Determine current centroid to preserve shape during the transformation
    const { sumX, sumY } = points.reduce(
      (acc, point) => ({ sumX: acc.sumX + point.x, sumY: acc.sumY + point.y }),
      { sumX: 0, sumY: 0 }
    );
    const currentCentroid = { x: sumX / points.length, y: sumY / points.length };

    // Place the distribution in a new random location within (and slightly beyond) current bounds
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const buffer = 0.2; // allow a bit of extra room outside the current bounds
    const newCenter = {
      x: (Math.random() * (1 + buffer * 2) + (buffer * -1)) * rangeX + minX,
      y: (Math.random() * (1 + buffer * 2) + (buffer * -1)) * rangeY + minY,
    };

    // Randomly decide to densify (<1) or enlarge (>1) the distribution
    const scale =
      Math.random() < 0.5
        ? Math.random() * 0.4 + 0.6 // 0.6 - 1.0 makes it denser
        : Math.random() * 0.8 + 1.2; // 1.2 - 2.0 enlarges it

    const explodedPoints = points.map(point => {
      const shiftedX = (point.x - currentCentroid.x) * scale;
      const shiftedY = (point.y - currentCentroid.y) * scale;
      return {
        x: newCenter.x + shiftedX,
        y: newCenter.y + shiftedY,
      };
    });

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
        setMainKMeansResult(result);
        setReclusterKMeansResult(null);
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
        setReclusterKMeansResult(result);
        setDistributions(distributionsBeforeKMeans.current);
        setAppState(AppState.RECLUSTER_COMPLETE);
      } catch (error) {
        console.error(error);
         alert(`Failed to run K-Means for k=${k}. Check console.`);
         setAppState(AppState.KMEANS_COMPLETE);
      }
      setIsLoading(false);
      setActiveColor(null);
    }, 50);
  }, []);

  const handlePointClick = (point: Point, color: string) => {
    const latestResult = reclusterKMeansResult ?? mainKMeansResult;
    if (!latestResult || !latestResult.centroids || latestResult.centroids.length === 0) {
      setSelectedPointInfo('Run K-Means to view distances to the latest cluster centers.');
      return;
    }

    let info = `Point (${point.x.toFixed(2)}, ${point.y.toFixed(2)}) from ${color} group.\nEuclidean distances to latest cluster centers (k=${latestResult.k}):\n`;
    latestResult.centroids.forEach((centerPoint, index) => {
      const dist = calculateEuclideanDistance(point, centerPoint);
      const clusterLabel = CLUSTER_FORM_LABELS[index] ?? `Cluster ${index + 1}`;
      info += `  - ${clusterLabel}: ${dist.toFixed(4)}\n`;
    });
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
            activeColor={activeColor}
            isLoading={isLoading}
          />
          <Statistics 
            initialOverlap={initialOverlap}
            sampleSize={parseInt(sampleSize) || undefined}
            mainKMeansResult={mainKMeansResult}
            reclusterKMeansResult={reclusterKMeansResult}
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
