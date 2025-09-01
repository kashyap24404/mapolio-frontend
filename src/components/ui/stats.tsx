"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StatItem {
  value: string;
  label: string;
  description?: string;
}

interface StatsProps {
  stats: StatItem[];
  className?: string;
  variant?: 'default' | 'cards' | 'minimal';
}

const Stats: React.FC<StatsProps> = ({ 
  stats, 
  className,
  variant = 'default' 
}) => {
  const containerClasses = {
    default: 'grid grid-cols-2 md:grid-cols-4 gap-8',
    cards: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    minimal: 'flex flex-wrap justify-center gap-8'
  };

  const itemClasses = {
    default: 'text-center',
    cards: 'bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20',
    minimal: 'text-center'
  };

  return (
    <div className={cn(containerClasses[variant], className)}>
      {stats.map((stat, index) => (
        <div key={index} className={itemClasses[variant]}>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {stat.value}
          </div>
          <div className="text-sm md:text-base font-medium text-gray-600 mb-1">
            {stat.label}
          </div>
          {stat.description && (
            <div className="text-xs text-gray-500">
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stats;