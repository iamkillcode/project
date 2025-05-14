/// <reference types="./types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Place, GooglePlacesResponse, PlaceDetails } from './types.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_MAPS_API_KEY environment variable');
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const cities = [
  { name: 'Accra', location: { lat: 5.6037, lng: -0.1870 } },
  { name: 'Kumasi', location: { lat: 6.6885, lng: -1.6244 } },
  { name: 'Tamale', location: { lat: 9.4067, lng: -0.8393 } },
  { name: 'Cape Coast', location: { lat: 5.1315, lng: -1.2795 } }
] as const;

const types = ['restaurant', 'store', 'shopping_mall', 'hotel', 'beauty_salon', 'cafe'] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Location {
  lat: number;
  lng: number;
}

interface City {
  name: string;
  location: Location;
}

async function fetchPlacesForCity(
  supabase: any,
  apiKey: string,
  city: City,
  type: string,
  pageToken?: string
): Promise<number> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${city.location.lat},${city.location.lng}`);
    url.searchParams.append('radius', '15000');
    url.searchParams.append('type', type);
    url.searchParams.append('key', apiKey);
    if (pageToken) {
      url.searchParams.append('pagetoken', pageToken);
    }

    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!response.ok || (data.status !== 'OK' && data.status !== 'ZERO_RESULTS')) {
      console.error(`Error fetching places: ${data.status || response.statusText}`);
      return 0;
    }

    const results = data.results || [];
    console.log(`Found ${results.length} ${type} places in ${city.name}`);

    for (const place of results) {
      try {
        // Get additional details
        const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        detailsUrl.searchParams.append('place_id', place.place_id);
        detailsUrl.searchParams.append('fields', 'website,formatted_phone_number');
        detailsUrl.searchParams.append('key', apiKey);
        
        const detailsResponse = await fetch(detailsUrl.toString());
        const details = await detailsResponse.json();

        const businessData = {
          name: place.name,
          description: place.types.map((t: string) => t.replace(/_/g, ' ')).join(', '),
          address: place.vicinity,
          city: city.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating || null,
          website: details.result?.website || null,
          phone: details.result?.formatted_phone_number || null,
          category: type.replace(/_/g, ' '),
          cover_image: place.photos?.[0]?.photo_reference 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
            : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('businesses')
          .upsert(businessData, {
            onConflict: 'name,address',
            ignoreDuplicates: true
          });

        if (error) {
          console.error('Error inserting business:', error);
        }
      } catch (error) {
        console.error('Error processing place:', error);
      }
    }

    // Handle pagination
    if (data.next_page_token) {
      // Google requires a short delay before using next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000));
      const nextPageCount = await fetchPlacesForCity(
        supabase,
        apiKey,
        city,
        type,
        data.next_page_token
      );
      return results.length + nextPageCount;
    }

    return results.length;
  } catch (error) {
    console.error(`Error fetching places for ${city.name}:`, error);
    return 0;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let totalPlaces = 0;
    const results: string[] = [];

    for (const city of cities) {
      for (const type of types) {
        try {
          const count = await fetchPlacesForCity(supabase, GOOGLE_API_KEY, city, type);
          totalPlaces += count;
          results.push(`Imported ${count} ${type} places in ${city.name}`);
        } catch (error) {
          console.error(`Error fetching ${type} places in ${city.name}:`, error);
          results.push(`Failed to import ${type} places in ${city.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Successfully imported ${totalPlaces} places`,
        details: results
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        details: 'Failed to fetch places from Google Places API'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});