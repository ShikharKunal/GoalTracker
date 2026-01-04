'use client';

interface PieChartProps {
  active: number;
  completed: number;
  size?: number;
}

export default function PieChart({ active, completed, size = 100 }: PieChartProps) {
  const total = active + completed;
  
  if (total === 0) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-full"
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-light text-gray-400 dark:text-gray-600">No data</span>
      </div>
    );
  }

  const activePercentage = (active / total) * 100;
  const completedPercentage = (completed / total) * 100;

  // Calculate angles in radians
  const activeAngle = (activePercentage / 100) * 2 * Math.PI;
  const completedAngle = (completedPercentage / 100) * 2 * Math.PI;

  const radius = size / 2 - 1;
  const center = size / 2;

  // Helper function to calculate point on circle
  const getPoint = (angle: number) => {
    return {
      x: center + radius * Math.cos(angle - Math.PI / 2),
      y: center + radius * Math.sin(angle - Math.PI / 2),
    };
  };

  // Calculate paths
  const activeStart = getPoint(0);
  const activeEnd = getPoint(activeAngle);
  const completedEnd = getPoint(activeAngle + completedAngle);

  const activePath = active > 0 ? `
    M ${center} ${center}
    L ${activeStart.x} ${activeStart.y}
    A ${radius} ${radius} 0 ${activeAngle > Math.PI ? 1 : 0} 1 ${activeEnd.x} ${activeEnd.y}
    Z
  ` : '';

  const completedPath = completed > 0 ? `
    M ${center} ${center}
    L ${activeEnd.x} ${activeEnd.y}
    A ${radius} ${radius} 0 ${completedAngle > Math.PI ? 1 : 0} 1 ${completedEnd.x} ${completedEnd.y}
    Z
  ` : '';

  return (
    <div className="flex flex-col items-center space-y-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="dark:invert">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#f3f4f6"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {active > 0 && (
          <path
            d={activePath}
            fill="#000000"
            stroke="#ffffff"
            strokeWidth="1"
          />
        )}
        {completed > 0 && (
          <path
            d={completedPath}
            fill="#9ca3af"
            stroke="#ffffff"
            strokeWidth="1"
          />
        )}
      </svg>
      <div className="flex gap-3 text-xs font-light">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white"></div>
          <span className="text-gray-600 dark:text-gray-400">{active}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400">{completed}</span>
        </div>
      </div>
    </div>
  );
}

