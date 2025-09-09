// components/ui/TabPanel.tsx
import React from 'react';

export interface TabPanelProps {
  value: string;
  activeKey: string;
  className?: string;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  activeKey,
  className = '',
  children,
}) => {
  if (value !== activeKey) return null;
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
};
