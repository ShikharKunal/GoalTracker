'use client';

import { format } from 'date-fns';
import type { ProgressLog } from '@/types';

interface ProgressGraphProps {
  logs: ProgressLog[];
  goalStartDate: string;
  goalEndDate: string;
  height?: number;
}

export default function ProgressGraph({ 
  logs, 
  goalStartDate, 
  goalEndDate,
  height = 80 
}: ProgressGraphProps) {
  if (logs.length === 0) {
    return (
      <div 
        className="border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-xs font-light text-gray-400 dark:text-gray-600">No progress logged yet</span>
      </div>
    );
  }

  // Sort logs by date
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const width = 300;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate positions
  const maxPercentage = 100;
  const points = sortedLogs.map((log, index) => {
    const x = padding + (index / (sortedLogs.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (log.percentage / maxPercentage) * chartHeight;
    return { x, y, percentage: log.percentage, date: log.logged_at };
  });

  // Create path for line
  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  // Create area path (for fill)
  const areaPath = points.length > 0
    ? `M ${padding},${padding + chartHeight} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${padding + chartHeight} Z`
    : '';

  return (
    <div className="space-y-2">
      <svg width={width} height={height} className="border-2 border-black dark:border-white bg-white dark:bg-black">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding + chartHeight - (percent / maxPercentage) * chartHeight;
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Area fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill="#000000"
            fillOpacity="0.05"
          />
        )}

        {/* Line */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#000000"
            stroke="#ffffff"
            strokeWidth="1"
          />
        ))}

        {/* Percentage labels on points */}
        {points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={point.y - 8}
            textAnchor="middle"
            className="text-[8px] font-light fill-black dark:fill-white"
          >
            {point.percentage}%
          </text>
        ))}
      </svg>

      {/* Date range */}
      <div className="flex justify-between text-xs font-light text-gray-600 dark:text-gray-400">
        <span>{format(new Date(goalStartDate), 'MMM d')}</span>
        <span>{format(new Date(goalEndDate), 'MMM d')}</span>
      </div>
    </div>
  );
}

