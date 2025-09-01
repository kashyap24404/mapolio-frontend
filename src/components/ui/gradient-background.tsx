import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'purple' | 'blue' | 'indigo' | 'pink' | 'gradient';
  className?: string;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'gradient',
  className
}) => {
  const variants = {
    purple: 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200',
    blue: 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200',
    indigo: 'bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200',
    pink: 'bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200',
    gradient: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
  };

  return (
    <div className={cn(
      'relative',
      variants[variant],
      className
    )}>
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;