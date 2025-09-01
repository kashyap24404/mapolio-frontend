"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500/20 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-purple-500/20 rounded-full blur-sm animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 -left-8 w-6 h-6 bg-indigo-500/20 rounded-full blur-sm animate-pulse delay-500"></div>
        <div className="absolute top-1/4 -right-8 w-10 h-10 bg-pink-500/20 rounded-full blur-sm animate-pulse delay-1500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-cyan-500/20 rounded-full blur-sm animate-pulse delay-2000"></div>
        <div className="absolute top-3/4 right-1/3 w-7 h-7 bg-violet-500/20 rounded-full blur-sm animate-pulse delay-700"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;