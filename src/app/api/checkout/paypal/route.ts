import { NextRequest, NextResponse } from 'next/server';
import * as paypal from '@paypal/checkout-server-sdk';
import { paypalClient } from '@/lib/paypal';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Function to get the active pricing plan
async function getActivePricingPlan() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('pricing_plan')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching pricing plan:', error);
      return null;
    }

    // Return the first active plan if any exist, otherwise null
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Unexpected error getting pricing plan:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { creditsToPurchase } = body;

    // Validate input
    if (!creditsToPurchase || creditsToPurchase < 1000) {
      return NextResponse.json(
        { error: "Invalid credits amount. Minimum purchase is 1,000 credits." },
        { status: 400 }
      );
    }

    // Create Supabase client using the centralized utility
    const supabase = await createServerSupabaseClient();

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("Session data:", session);
    console.log("Session error:", sessionError);

    if (sessionError) {
      console.error("Session retrieval error:", sessionError);
      return NextResponse.json({ error: "Authentication error: " + sessionError.message }, { status: 500 });
    }

    if (!session) {
      console.log("No session found - user not authenticated");
      return NextResponse.json({ error: "Unauthorized - No valid session. Please sign in first." }, { status: 401 });
    }

    // Get pricing plan
    const pricingPlan = await getActivePricingPlan();
    const pricePerCredit = pricingPlan?.price_per_credit || 0.003; // Fallback to $0.003 per credit
    
    // Calculate price (server-side calculation to prevent manipulation)
    const totalAmountInCents = Math.round(creditsToPurchase * pricePerCredit * 100); // Convert to cents
    const totalAmountInDollars = (totalAmountInCents / 100).toFixed(2);

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    
    // Create custom ID with all required information for the webhook
    const customId = JSON.stringify({
      userId: session.user.id,
      creditsPurchased: creditsToPurchase,
      amountPaidCents: totalAmountInCents
    });

    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmountInDollars
          },
          description: `Purchase of ${creditsToPurchase.toLocaleString()} credits`,
          custom_id: customId
        }
      ],
      application_context: {
        brand_name: "Mapolio",
        landing_page: "NO_PREFERENCE",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pricing`
      }
    });

    // Execute request
    const client = paypalClient();
    const response = await client.execute(request);

    // Find and return approval URL for redirect
    const approvalUrl = response.result.links.find((link: any) => link.rel === "approve")?.href;

    return NextResponse.json({
      orderId: response.result.id,
      approvalUrl
    });
    
  } catch (error: any) {
    console.error("PayPal order creation error:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to create PayPal order";
    if (error.message) {
      errorMessage += ": " + error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}