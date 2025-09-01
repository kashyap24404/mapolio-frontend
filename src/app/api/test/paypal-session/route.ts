import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
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
      return NextResponse.json({ 
        success: true,
        message: "No active session found",
        session: null
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Session retrieved successfully",
      session: {
        user: {
          id: session.user.id,
          email: session.user.email
        }
      }
    });
    
  } catch (error: any) {
    console.error("Session test error:", error);
    return NextResponse.json(
      { error: "Failed to test session: " + error.message },
      { status: 500 }
    );
  }
}