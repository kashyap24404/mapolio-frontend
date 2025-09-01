import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are set
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const sandbox = process.env.PAYPAL_SANDBOX;
    
    return NextResponse.json({
      clientIdSet: !!clientId,
      clientSecretSet: !!clientSecret,
      sandboxMode: sandbox === 'true',
      clientIdLength: clientId ? clientId.length : 0,
      clientSecretLength: clientSecret ? clientSecret.length : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check environment variables' }, { status: 500 });
  }
}