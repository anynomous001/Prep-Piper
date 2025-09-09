import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;   // the icon key, e.g. 'check' or 'x'
  size?: number;  // pixel size
  className?: string;
}

const iconPaths: Record<string, string> = {
  check: 'M5 13l4 4L19 7', 
  x:     'M6 18L18 6M6 6l12 12',
  // add more SVG path data here
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', ...props }) => {
  const pathData = iconPaths[name];
  if (!pathData) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d={pathData} />
    </svg>
  );
};
