import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Distributions, Point, Centroids, KMeansResult } from './types';
import { Controls } from './components/Controls';
import { ScatterPlot } from './components/ScatterPlot';
import { Statistics } from './components/Statistics';
import { Notification } from './components/Notification';
import { generateGaussianDistributions } from './utils/distribution';
import { runKMeansClientSide } from './utils/kmeans';
import { calculateCosineDistance } from './utils/math';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // User inputs
  const [sampleSize, setSampleSize] = useState<string>('200');

  // Data
  const [distributions, setDistributions] = useState<Distributions>({});
  const [initialCentroids, setInitialCentroids] = useState<Centroids>({});
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
        const { distributions: newDistributions, initialCentroids: newCentroids, actualOverlap } = result;
        setDistributions(newDistributions || {});
        setInitialCentroids(newCentroids || {});
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
    if (!points) return;
    
    // Find view bounds to scatter points within
    const allPoints: Point[] = Object.values(distributions).flat() as Point[];
    const xCoords = allPoints.map(p => p.x);
    const yCoords = allPoints.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const explodedPoints = points.map(() => ({
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
    }));

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
    if (!initialCentroids || Object.keys(initialCentroids).length === 0) return;

    let info = `Point (${point.x.toFixed(2)}, ${point.y.toFixed(2)}) from ${color} group.\nCosine Distances to original centers:\n`;
    Object.entries(initialCentroids).forEach(([centerColor, centerPoint]) => {
      const dist = calculateCosineDistance(point, centerPoint);
      info += `  - ${centerColor}: ${dist.toFixed(4)}\n`;
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