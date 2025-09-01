"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import AnimatedBackground from '@/components/ui/animated-background';
import { Loader2 } from 'lucide-react';
import { useSupabase } from '@/lib/supabase-provider';

interface DashboardPreviewProps {
  imageSrc?: string;
  imageAlt?: string;
  width?: number;
  height?: number;
  showAnimation?: boolean;
  creditsToPurchase?: number;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  imageSrc = "/dashbaordHero.svg",
  imageAlt = "Metafi Dashboard Preview",
  width = 1200,
  height = 800,
  showAnimation = true,
  creditsToPurchase
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useSupabase();

  // Function to handle PayPal payment initialization
  const handlePayPalPayment = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (!creditsToPurchase || creditsToPurchase < 1000) {
      setError("Invalid credit amount. Minimum purchase is 1,000 credits.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditsToPurchase }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received from PayPal');
      }
    } catch (err) {
      console.error('PayPal checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      {/* PayPal Button overlay if credits to purchase is provided */}
      {creditsToPurchase && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Complete Your Purchase
            </h3>
            <p className="mb-6 text-center">
              You are about to purchase {creditsToPurchase.toLocaleString()} credits for ${(creditsToPurchase * 0.003).toFixed(2)}
            </p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              <button
                onClick={handlePayPalPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Proceed to PayPal Checkout
              </button>
            )}
          </div>
        </div>
      )}
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