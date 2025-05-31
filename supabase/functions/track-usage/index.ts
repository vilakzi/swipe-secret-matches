
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { action } = await req.json();
    
    if (action === 'scroll') {
      // Update or create daily usage record
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingUsage } = await supabaseClient
        .from('daily_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingUsage) {
        const { error } = await supabaseClient
          .from('daily_usage')
          .update({
            profile_scrolls: existingUsage.profile_scrolls + 1,
            last_scroll_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUsage.id);

        if (error) throw error;

        return new Response(JSON.stringify({
          scrolls_today: existingUsage.profile_scrolls + 1,
          remaining_scrolls: Math.max(0, 5 - (existingUsage.profile_scrolls + 1))
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        const { error } = await supabaseClient
          .from('daily_usage')
          .insert({
            user_id: user.id,
            date: today,
            profile_scrolls: 1,
            last_scroll_at: new Date().toISOString()
          });

        if (error) throw error;

        return new Response(JSON.stringify({
          scrolls_today: 1,
          remaining_scrolls: 4
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Get current usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabaseClient
      .from('daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const scrollsToday = usage?.profile_scrolls || 0;
    const remainingScrolls = Math.max(0, 5 - scrollsToday);

    return new Response(JSON.stringify({
      scrolls_today: scrollsToday,
      remaining_scrolls: remainingScrolls
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
