$env:GOOGLE_MAPS_API_KEY="your_api_key_here"
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

deno run --allow-net --allow-env --import-map=import_map.json index.ts
