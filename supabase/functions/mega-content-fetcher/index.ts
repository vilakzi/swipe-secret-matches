
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

    if (!MEGA_EMAIL || !MEGA_PASSWORD || !MEGA_FOLDER_URL) {
      return new Response(
        JSON.stringify({ error: 'MEGA credentials not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For now, return mock data since we can't use the Python MEGA library directly
    // In production, you'd use a MEGA API wrapper for JavaScript/TypeScript
    const mockFiles: MegaFile[] = [
      {
        name: 'video1.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: 'video',
        timestamp: Date.now() - 1000000
      },
      {
        name: 'image1.jpg',
        url: 'https://picsum.photos/400/600?random=101',
        type: 'image',
        timestamp: Date.now() - 500000
      },
      {
        name: 'video2.mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        type: 'video',
        timestamp: Date.now() - 200000
      },
      {
        name: 'image2.jpg',
        url: 'https://picsum.photos/400/600?random=102',
        type: 'image',
        timestamp: Date.now() - 100000
      }
    ]

    // Sort by timestamp and return the files
    const sortedFiles = mockFiles.sort((a, b) => a.timestamp - b.timestamp)

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
