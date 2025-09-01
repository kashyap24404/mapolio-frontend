"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SophisticatedGradientProps {
  children: React.ReactNode;
  className?: string;
}

const SophisticatedGradient: React.FC<SophisticatedGradientProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('relative overflow-hidden min-h-screen', className)}>
      {/* CSS Custom Properties for gradient colors */}
      <style jsx>{`
        .gradient-container {
          --purple: #6943FF;
          --blue: #5FA8FF;
          --cyan: #6FE5FF;
          --light-cyan: #33BDF8;
          --dark: #08090A;
        }
      `}</style>
      
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 gradient-container" />
      
      {/* Main gradient overlay with opacity */}
      <div className="absolute inset-0 opacity-30" style={{
        borderBottom: '1px solid rgba(8, 9, 10, 0.08)'
      }} />
      
      {/* Complex gradient system - positioned elements */}
      <div className="absolute inset-0">
        {/* Top area gradients */}
        <div className="absolute opacity-25 blur-[75px] rounded-full" style={{
          left: '6.52%', width: '27.01%', top: '0%', height: '50.89%',
          background: 'rgba(51, 189, 248, 0.25)'
        }} />
        
        <div className="absolute opacity-25 blur-[75px] rounded-full" style={{
          left: '78.02%', width: '27.15%', top: '-4.44%', height: '57.66%',
          background: 'rgba(105, 67, 255, 0.25)'
        }} />
        
        <div className="absolute opacity-25 blur-[75px] rounded-full" style={{
          left: '53.49%', width: '27.16%', top: '-19.33%', height: '87.44%',
          background: 'rgba(105, 67, 255, 0.25)'
        }} />
        
        {/* Mid-layer gradients */}
        <div className="absolute opacity-40 blur-[80px]" style={{
          left: '10.96%', width: '47.37%', top: '41.55%', height: '50.23%',
          background: 'linear-gradient(233.53deg, var(--purple) 21.11%, var(--blue) 50%, var(--cyan) 78.89%)'
        }} />
        
        <div className="absolute opacity-30 blur-[56px]" style={{
          left: '17.4%', width: '51.64%', top: '40%', height: '40%',
          background: 'linear-gradient(146.31deg, var(--purple) 21.11%, var(--blue) 50%, var(--cyan) 78.89%)'
        }} />
        
        <div className="absolute opacity-30 blur-[56px]" style={{
          left: '0.18%', width: '51.64%', top: '53.33%', height: '40%',
          background: 'linear-gradient(326.31deg, var(--purple) 21.11%, var(--blue) 50%, var(--cyan) 78.89%)'
        }} />
        
        {/* Right side complex */}
        <div className="absolute opacity-40 blur-[80px]" style={{
          left: '35.35%', width: '42.88%', top: '46.44%', height: '70.23%',
          background: 'linear-gradient(233.53deg, var(--purple) 21.11%, var(--blue) 50%, var(--cyan) 78.89%)'
        }} />
        
        <div className="absolute opacity-30 blur-[56px]" style={{
          left: '39.57%', width: '51.65%', top: '54.89%', height: '40%',
          background: 'linear-gradient(146.31deg, var(--purple) 21.11%, var(--blue) 50%, var(--cyan) 78.89%)'
        }} />
        
        {/* Additional accent elements */}
        <div className="absolute blur-[146px]" style={{
          left: '47.51%', width: '37.84%', top: '65.74%', height: '53.23%',
          background: 'var(--light-cyan)'
        }} />
        
        <div className="absolute blur-[96px]" style={{
          left: '65.41%', width: '17.65%', top: '50.44%', height: '20.41%',
          background: 'var(--blue)'
        }} />
        
        <div className="absolute opacity-60 blur-[100px]" style={{
          left: '11.42%', width: '50.27%', top: '55.68%', height: '58.21%',
          background: 'var(--purple)'
        }} />
      </div>
      
      {/* Dark overlay elements for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute blur-[27px] opacity-20 mix-blend-overlay" style={{
          left: '13.91%', width: '35.57%', top: '24.43%', height: '67%',
          background: 'var(--dark)'
        }} />
        
        <div className="absolute blur-[36px] opacity-15 mix-blend-overlay" style={{
          left: '37.48%', width: '43.51%', top: '23.44%', height: '70.18%',
          background: 'var(--dark)'
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SophisticatedGradient;