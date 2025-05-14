/// <reference types="https://deno.land/x/types/index.d.ts" />

declare module "std/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "@supabase/supabase-js" {
  export * from "npm:@supabase/supabase-js";
}

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

declare module "https://*" {
  export * from "@types/node";
}
