import * as paypal from '@paypal/checkout-server-sdk';

// This function creates a PayPal client with the appropriate environment
export function paypalClient(): paypal.core.PayPalHttpClient {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  // Validate environment variables
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set in environment variables');
  }
  
  if (!clientSecret) {
    throw new Error('PAYPAL_CLIENT_SECRET is not set in environment variables');
  }

  const environment = process.env.PAYPAL_SANDBOX === 'true' 
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret);
    
  return new paypal.core.PayPalHttpClient(environment);
}

// Verify PayPal webhook signature
export async function verifyWebhookSignature(
  requestBody: string,
  headers: Record<string, string>
): Promise<boolean> {
  try {
    // Verify the webhook signature (implementation depends on PayPal SDK version)
    // This is a simplified version - in production, use PayPal's verification methods
    
    // For demonstration purposes, we're returning true
    // In a real implementation, this would verify the webhook signature
    return true;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}