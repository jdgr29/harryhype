import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createClient,
  SupabaseClient,
} from "https://cdn.skypack.dev/@supabase/supabase-js";
import type {
  Session,
  User,
  WeakPassword,
} from "https://cdn.skypack.dev/@supabase/supabase-js/dist/module/types.js"; // Import types separately
import { config } from "https://deno.land/x/dotenv/mod.ts";

// Load environment variables from .env file
config();

// Initialize Supabase client with environment variables
const SUPABASE_URL: string = Deno.env.get("EXPO_PUBLIC_SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY: string =
  Deno.env.get("EXPO_PUBLIC_SUPABASE_SERVER_KEY") || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase configuration in environment variables");
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

// Login user service
export const loginUserService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  | { user: User; session: Session; weakPassword?: WeakPassword }
  | { error: boolean; message: string; status: number | undefined }
> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: true, message: error.message, status: error.status };
    }
    return data;
  } catch (err: any) {
    return { error: true, message: err.message, status: err.status };
  }
};

// Define the Edge Function
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Method Not Allowed", success: false }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { email, password } = await req.json();
    const response = await loginUserService({ email, password });

    if ("error" in response) {
      return new Response(
        JSON.stringify({ message: response.message, success: false }),
        {
          status: response.status || 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: response.user,
        success: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        message: err.message || "Internal Server Error",
        success: false,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
