import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Section: React.FC<SectionProps> = ({
  children,
  className,
  id,
  padding = 'lg'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-28'
  };

  return (
    <section 
      id={id}
      className={cn(
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </section>
  );
};

export default Section;