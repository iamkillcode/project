import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const cities = [
  { name: 'Accra', location: { lat: 5.6037, lng: -0.1870 } },
  { name: 'Kumasi', location: { lat: 6.6885, lng: -1.6244 } }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function fetchPlacesForCity(city: typeof cities[0]) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.append('location', `${city.location.lat},${city.location.lng}`);
  url.searchParams.append('radius', '10000');
  url.searchParams.append('type', 'establishment');
  url.searchParams.append('key', GOOGLE_API_KEY!);

  const response = await fetch(url.toString());
  const data = await response.json();
  
  for (const place of data.results) {
    const { error } = await supabase.from('businesses').upsert({
      name: place.name,
      address: place.vicinity,
      city: city.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      description: place.types.join(', '),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'name,address'
    });

    if (error) {
      console.error('Error inserting business:', error);
    }
  }

  return data.results.length;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let totalPlaces = 0;
    for (const city of cities) {
      const count = await fetchPlacesForCity(city);
      totalPlaces += count;
    }

    return new Response(
      JSON.stringify({ message: `Successfully imported ${totalPlaces} places` }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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