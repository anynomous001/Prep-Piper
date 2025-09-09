import React from 'react';

export interface ProgressCircleProps {
  size: number;
  strokeWidth: number;
  percentage: number; // 0–100
  color?: 'green' | 'yellow' | 'red';
  children?: React.ReactNode;
  className?: string;
}

const COLORS: Record<string, string> = {
  green: '#10B981',
  yellow: '#F59E0B',
  red:    '#EF4444',
};

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  size,
  strokeWidth,
  percentage,
  color = 'green',
  children,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
