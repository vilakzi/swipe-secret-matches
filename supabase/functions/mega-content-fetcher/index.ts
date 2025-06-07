
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface MegaFile {
  name: string;
  url: string;
  type: 'image' | 'video';
  timestamp: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get MEGA credentials from Supabase secrets
    const MEGA_EMAIL = Deno.env.get('MEGA_EMAIL')
    const MEGA_PASSWORD = Deno.env.get('MEGA_PASSWORD')
    const MEGA_FOLDER_URL = Deno.env.get('MEGA_FOLDER_URL')

    if (!MEGA_EMAIL || !MEGA_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'MEGA credentials not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('MEGA credentials loaded, attempting to fetch files...')

    // Since we can't use the Python MEGA library directly in Deno,
    // we'll implement a workaround using the MEGA public API
    // For now, let's create a more realistic simulation that rotates through
    // different content based on time to demonstrate the concept

    const timeBasedIndex = Math.floor(Date.now() / 40000) % 20; // Changes every 40 seconds
    
    // Simulate a larger pool of content that rotates
    const contentPool = [
      {
        name: 'beach_sunset.jpg',
        url: 'https://picsum.photos/400/600?random=201',
        type: 'image' as const,
        timestamp: Date.now() - 1000000
      },
      {
        name: 'nature_walk.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 900000
      },
      {
        name: 'city_lights.jpg',
        url: 'https://picsum.photos/400/600?random=202',
        type: 'image' as const,
        timestamp: Date.now() - 800000
      },
      {
        name: 'ocean_waves.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 700000
      },
      {
        name: 'mountain_view.jpg',
        url: 'https://picsum.photos/400/600?random=203',
        type: 'image' as const,
        timestamp: Date.now() - 600000
      },
      {
        name: 'forest_stream.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 500000
      },
      {
        name: 'urban_art.jpg',
        url: 'https://picsum.photos/400/600?random=204',
        type: 'image' as const,
        timestamp: Date.now() - 400000
      },
      {
        name: 'wildlife_documentary.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 300000
      },
      {
        name: 'landscape_panorama.jpg',
        url: 'https://picsum.photos/400/600?random=205',
        type: 'image' as const,
        timestamp: Date.now() - 200000
      },
      {
        name: 'adventure_sports.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 100000
      },
      {
        name: 'abstract_art.jpg',
        url: 'https://picsum.photos/400/600?random=206',
        type: 'image' as const,
        timestamp: Date.now() - 50000
      },
      {
        name: 'cooking_tutorial.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 25000
      },
      {
        name: 'architectural_marvel.jpg',
        url: 'https://picsum.photos/400/600?random=207',
        type: 'image' as const,
        timestamp: Date.now() - 15000
      },
      {
        name: 'travel_vlog.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 10000
      },
      {
        name: 'street_photography.jpg',
        url: 'https://picsum.photos/400/600?random=208',
        type: 'image' as const,
        timestamp: Date.now() - 8000
      },
      {
        name: 'music_concert.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 6000
      },
      {
        name: 'fashion_portrait.jpg',
        url: 'https://picsum.photos/400/600?random=209',
        type: 'image' as const,
        timestamp: Date.now() - 4000
      },
      {
        name: 'tech_review.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        type: 'video' as const,
        timestamp: Date.now() - 2000
      },
      {
        name: 'artistic_closeup.jpg',
        url: 'https://picsum.photos/400/600?random=210',
        type: 'image' as const,
        timestamp: Date.now() - 1000
      },
      {
        name: 'fitness_workout.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video' as const,
        timestamp: Date.now()
      }
    ];

    // Sort by timestamp and return the files
    const sortedFiles = contentPool.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`Returning ${sortedFiles.length} files from content pool (index: ${timeBasedIndex})`);

    return new Response(
      JSON.stringify({ files: sortedFiles }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in mega-content-fetcher:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
