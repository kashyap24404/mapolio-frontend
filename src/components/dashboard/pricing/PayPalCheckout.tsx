'use client'

import React from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useSupabase } from '@/lib/supabase/index'

interface PayPalCheckoutProps {
  currentCredits: number
  setShowPayPal: (show: boolean) => void
  user: any
}

export default function PayPalCheckout({
  currentCredits,
  setShowPayPal,
  user
}: PayPalCheckoutProps) {
  const { purchaseCredits } = useSupabase()
  
  // Handle PayPal order creation
  const createOrder = async () => {
    try {
      console.log("Starting PayPal order creation...")
      
      // Check if user is authenticated before proceeding
      if (!user) {
        throw new Error('User not authenticated. Please sign in first.')
      }
      
      const response = await fetch('/api/checkout/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditsToPurchase: currentCredits }),
        credentials: 'include' // Ensure cookies are sent with the request
      })
      
      console.log("API response status:", response.status)
      const data = await response.json()
      
      if (!response.ok) {
        console.error("API error details:", data)
        throw new Error(data.error || 'Failed to create order')
      }
      
      console.log("Order created successfully:", data)
      return data.orderId
    } catch (err) {
      console.error('Detailed error creating PayPal order:', err)
      throw err
    }
  }
  
  // Handle PayPal order approval
  const onApprove = async (data: { orderID: string }) => {
    try {
      // The payment is completed on the server via webhook
      // Here we just show a success message and refresh credits
      alert(`Purchase successful! You will receive ${currentCredits.toLocaleString()} credits shortly.`)
      await purchaseCredits(0, 0) // Just to trigger a credits refresh
      setShowPayPal(false)
    } catch (err) {
      console.error('Error finalizing PayPal order:', err)
    }
  }
  
  // Handle PayPal cancel
  const onCancel = () => {
    console.log('Payment cancelled')
    setShowPayPal(false)
  }
  
  return (
    <div className="mb-6">
      <PayPalScriptProvider options={{ 
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency: "USD",
        intent: "capture"
      }}>
        <PayPalButtons
          style={{ layout: "vertical" }}
          forceReRender={[currentCredits]}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            console.error('PayPal Buttons error:', err)
            setShowPayPal(false)
          }}
          onCancel={onCancel}
        />
      </PayPalScriptProvider>
      <button 
        onClick={() => setShowPayPal(false)} 
        className="w-full mt-2 py-2 text-sm text-center text-gray-600 hover:underline"
      >
        Cancel and go back
      </button>
    </div>
  )
}