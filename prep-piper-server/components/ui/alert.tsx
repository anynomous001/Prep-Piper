// components/ui/Alert.tsx
import React from 'react';
import clsx from 'clsx';

export type AlertVariant = 'default' | 'destructive' | 'info' | 'warning' | 'success';

export interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const baseStyles = 'rounded-md p-4 text-sm';
  const variantStyles: Record<AlertVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
  };

  return (
    <div className={clsx(baseStyles, variantStyles[variant], className)}>
      {children}
    </div>
  );
};
