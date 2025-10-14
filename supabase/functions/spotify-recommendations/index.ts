import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's Spotify tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('user_spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('No Spotify connection found');
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token;
    const expiresAt = new Date(tokenData.expires_at);
    
    if (expiresAt <= new Date()) {
      // Refresh the token
      const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
      const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token,
        }),
      });

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update token in database
      await supabaseClient
        .from('user_spotify_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Get user's top tracks and artists for seed data
    const [topTracksRes, topArtistsRes] = await Promise.all([
      fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }),
      fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }),
    ]);

    const topTracks = await topTracksRes.json();
    const topArtists = await topArtistsRes.json();

    // Get recommendations
    const seedTracks = topTracks.items?.slice(0, 2).map((t: any) => t.id).join(',') || '';
    const seedArtists = topArtists.items?.slice(0, 3).map((a: any) => a.id).join(',') || '';

    const recommendationsRes = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks}&seed_artists=${seedArtists}&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const recommendations = await recommendationsRes.json();

    // Store recommendations in database
    const today = new Date().toISOString().split('T')[0];
    
    // Clear today's recommendations first
    await supabaseClient
      .from('daily_recommendations')
      .delete()
      .eq('user_id', user.id)
      .eq('recommendation_date', today);

    // Insert new recommendations
    const recommendationsToInsert = recommendations.tracks?.map((track: any) => ({
      user_id: user.id,
      track_id: track.id,
      track_name: track.name,
      artist_name: track.artists.map((a: any) => a.name).join(', '),
      album_name: track.album.name,
      album_image_url: track.album.images[0]?.url,
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      recommendation_date: today,
    })) || [];

    if (recommendationsToInsert.length > 0) {
      await supabaseClient
        .from('daily_recommendations')
        .insert(recommendationsToInsert);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendations: recommendationsToInsert 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});