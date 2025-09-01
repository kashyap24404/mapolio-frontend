import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Create a Supabase client with the Deno runtime
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Log environment for debugging (will be visible in Supabase logs)
console.log(`Supabase URL: ${supabaseUrl ? "Set" : "Not Set"}`);
console.log(`Service Role Key: ${supabaseKey ? "Set" : "Not Set"}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Verify we can connect to Supabase (useful for troubleshooting)
async function verifySupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log('Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
}

/**
 * Verifies the PayPal webhook signature to ensure it's a genuine request
 * @param payload - The raw webhook payload
 * @param headers - The headers from the webhook request
 * @returns True if signature is valid, false otherwise
 */
async function verifyPayPalWebhook(payload: string, headers: Headers): Promise<boolean> {
  try {
    // In production, implement real webhook signature verification
    // using PayPal's webhook-id and the WEBHOOK_ID from your environment
    
    // For development, this is a simple check that can be enhanced later
    const paypalHeaders = [
      'paypal-auth-algo',
      'paypal-auth-version',
      'paypal-cert-url',
      'paypal-transmission-id',
      'paypal-transmission-sig',
      'paypal-transmission-time'
    ];
    
    // Check if all required headers are present
    const hasAllHeaders = paypalHeaders.every(header => 
      headers.has(header.toLowerCase()));
    
    if (!hasAllHeaders) {
      console.error('Missing required PayPal webhook headers');
      return false;
    }
    
    // In a real implementation, you would verify the signature here
    // For now, we'll trust requests with all required headers
    return true;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

// Main handler function for the webhook
serve(async (req) => {
  try {
    console.log('PayPal webhook received');
    
    // First, verify connection to Supabase (for troubleshooting)
    if (!(await verifySupabaseConnection())) {
      return new Response(JSON.stringify({ error: 'Database connection failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body and headers
    const rawBody = await req.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON payload', e);
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log the event type for debugging
    console.log(`Webhook event type: ${payload.event_type}`);
    
    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(rawBody, req.headers);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if this is a payment capture completed or order approved event
    if (payload.event_type !== 'PAYMENT.CAPTURE.COMPLETED' && 
        payload.event_type !== 'CHECKOUT.ORDER.APPROVED') {
      console.log(`Ignoring non-payment event: ${payload.event_type}`);
      return new Response(JSON.stringify({ status: 'ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract transaction ID
    const resource = payload.resource;
    const transactionId = resource.id || 
      (resource.purchase_units && resource.purchase_units[0]?.payments?.captures?.[0]?.id);
    
    if (!transactionId) {
      console.error('No transaction ID in payload');
      return new Response(JSON.stringify({ error: 'No transaction ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for duplicate transactions
    const { data: existingTx, error: txError } = await supabase
      .from('profile_buy_transactions')
      .select('id')
      .eq('gateway_transaction_id', transactionId)
      .maybeSingle();
    
    if (txError) {
      console.error('Error checking for duplicate transaction:', txError);
    }
    
    if (existingTx) {
      console.log(`Transaction ${transactionId} already processed`);
      return new Response(JSON.stringify({ status: 'already_processed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract custom_id
    const customId = resource.custom_id || 
      (resource.purchase_units && resource.purchase_units[0]?.custom_id);
    
    if (!customId) {
      console.error('No custom_id in payload');
      return new Response(JSON.stringify({ error: 'Missing custom_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse the custom_id
    let parsedCustomId;
    try {
      parsedCustomId = JSON.parse(customId);
    } catch (e) {
      console.error('Invalid custom_id format:', e);
      return new Response(JSON.stringify({ error: 'Invalid custom_id format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { userId, creditsPurchased, amountPaidCents } = parsedCustomId;
    
    if (!userId || !creditsPurchased || !amountPaidCents) {
      console.error('Missing required data in custom_id');
      return new Response(JSON.stringify({ error: 'Missing data in custom_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log the payment details for debugging
    console.log(`Processing payment for user ${userId}: ${creditsPurchased} credits, $${amountPaidCents/100}`);
    
    // Call RPC function to process payment
    const { data, error } = await supabase.rpc('finalize_dynamic_paypal_purchase', {
      user_id_input: userId,
      credits_to_add: creditsPurchased,
      amount_cents_input: amountPaidCents,
      gateway_id_input: transactionId,
      gateway_payload: payload
    });
    
    if (error) {
      console.error('Error processing payment:', error);
      return new Response(JSON.stringify({ error: 'Payment processing failed', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Payment processed successfully:', data);
    return new Response(JSON.stringify({ 
      success: true, 
      transactionId,
      userId,
      credits: creditsPurchased
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message || String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});