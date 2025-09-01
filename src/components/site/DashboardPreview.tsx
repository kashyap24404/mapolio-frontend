"use client";

import React from 'react';
import Image from 'next/image';
import AnimatedBackground from '@/components/ui/animated-background';

interface DashboardPreviewProps {
  imageSrc?: string;
  imageAlt?: string;
  width?: number;
  height?: number;
  showAnimation?: boolean;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  imageSrc = "/dashbaordHero.svg",
  imageAlt = "Metafi Dashboard Preview",
  width = 1200,
  height = 800,
  showAnimation = true
}) => {
  const dashboardContent = (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm border border-white/30">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={width}
        height={height}
        className="w-full h-auto"
        priority
      />
    </div>
  );

  return (
    <div className="relative max-w-4xl mx-auto mb-20">
      {showAnimation ? (
        <AnimatedBackground>
          {dashboardContent}
        </AnimatedBackground>
      ) : (
        dashboardContent
      )}
    </div>
  );
};

export default DashboardPreview;