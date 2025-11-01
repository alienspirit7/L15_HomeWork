import React from 'react';
import { AppState, DISTRIBUTION_COLORS } from '../types';

interface ControlsProps {
  appState: AppState;
  sampleSize: string;
  setSampleSize: (val: string) => void;
  onBuild: () => void;
  onMoveSelect: (color: string) => void;
  onExplodeSelect: (color: string) => void;
  onDefineGroups: () => void;
  onRecluster: (k: number) => void;
  onResetToMainClustering: () => void;
  activeColor: string | null;
  isLoading: boolean;
}

// FIX: Extracted props to a named interface for clarity and to resolve typing issues.
interface ColorButtonProps {
  color: string;
  text: string;
  onClick: () => void;
  active: boolean;
  disabled: boolean;
}

// FIX: Explicitly type ColorButton as a React.FC to resolve issues with the 'key' prop being incorrectly typed.
const ColorButton: React.FC<ColorButtonProps> = ({ color, text, onClick, active, disabled }) => {
  const baseClasses = "w-full text-white font-bold py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const activeClasses = `bg-${color}-500 hover:bg-${color}-600 focus:ring-${color}-500`;
  const inactiveClasses = `bg-${color}-500 hover:bg-${color}-600 focus:ring-${color}-500`;
  const disabledClasses = "bg-gray-600 cursor-not-allowed opacity-50";

  let finalClasses = baseClasses;
  if(disabled) {
    finalClasses += ` ${disabledClasses}`;
  } else if (active) {
    finalClasses += ` ${activeClasses}`;
  } else {
    finalClasses += ` ${inactiveClasses}`;
  }

  return <button onClick={onClick} disabled={disabled} className={finalClasses} style={{backgroundColor: disabled ? '' : DISTRIBUTION_COLORS[color]}}>{text}</button>;
};


export const Controls: React.FC<ControlsProps> = ({
  appState,
  sampleSize,
  setSampleSize,
  onBuild,
  onMoveSelect,
  onExplodeSelect,
  onDefineGroups,
  onRecluster,
  onResetToMainClustering,
  activeColor,
  isLoading,
}) => {
  
  const renderContent = () => {
    switch (appState) {
      case AppState.INITIAL:
      case AppState.GENERATING_DISTRIBUTIONS:
        return (
          <>
            <div>
              <label htmlFor="sampleSize" className="block text-sm font-medium text-gray-300">Sample Size / Group</label>
              <input type="number" id="sampleSize" value={sampleSize} onChange={(e) => setSampleSize(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2"
                placeholder="e.g., 200"
              />
            </div>
            <button onClick={onBuild} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-500">
              {isLoading ? 'Building...' : 'Build Distributions'}
            </button>
          </>
        );

      case AppState.AWAITING_MOVE_SELECTION:
      case AppState.MOVING_DISTRIBUTION:
        return (
          <>
            <p className="text-center text-gray-400">Select a distribution to move.</p>
            {Object.keys(DISTRIBUTION_COLORS).map(color => (
              <ColorButton key={color} color={color} text={`Move ${color.charAt(0).toUpperCase() + color.slice(1)}`}
                onClick={() => onMoveSelect(color)}
                active={activeColor === color}
                disabled={appState === AppState.MOVING_DISTRIBUTION && activeColor !== color} />
            ))}
          </>
        );

      case AppState.AWAITING_EXPLODE_SELECTION:
      case AppState.EXPLODING_DISTRIBUTION:
        return (
          <>
            <p className="text-center text-gray-400">Select a distribution to explode.</p>
            {Object.keys(DISTRIBUTION_COLORS).map(color => (
              <ColorButton key={color} color={color} text={`Explode ${color.charAt(0).toUpperCase() + color.slice(1)}`}
                onClick={() => onExplodeSelect(color)}
                active={activeColor === color}
                disabled={appState === AppState.EXPLODING_DISTRIBUTION && activeColor !== color} />
            ))}
          </>
        );
      
      case AppState.AWAITING_KMEANS:
      case AppState.CLUSTERING:
        return (
            <button onClick={onDefineGroups} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-500">
              {isLoading ? 'Clustering...' : 'Define New Groups (K-Means)'}
            </button>
        );

      case AppState.KMEANS_COMPLETE:
      case AppState.RECLUSTERING:
      case AppState.RECLUSTER_COMPLETE:
        return (
          <>
            <p className="text-center text-gray-400">Try clustering with a different K.</p>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => onRecluster(2)}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-500"
                >
                  {isLoading && activeColor === 'k2' ? 'Running...' : 'Try 2 Groups'}
                </button>
                <button
                  onClick={() => onRecluster(4)}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-500"
                >
                  {isLoading && activeColor === 'k4' ? 'Running...' : 'Try 4 Groups'}
                </button>
              </div>
              <button
                onClick={onResetToMainClustering}
                disabled={isLoading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-500"
              >
                Back to k=3 Result
              </button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-inner space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 border-b border-gray-600 pb-2">Controls</h3>
      {renderContent()}
    </div>
  );
};
