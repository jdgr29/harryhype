import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Keypair } from "npm:@solana/web3.js";
import { createClient } from "npm:@supabase/supabase-js";
import { Buffer } from "node:buffer";
import { config } from "npm:dotenv";

// Load environment variables
config();

// Function to create a Solana wallet
const createWallet = () => {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toString(),
    secretKey: Buffer.from(keypair.secretKey).toString("base64"),
  };
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!,
);

const supabaseImageUploader = async (
  image: Buffer | FormDataEntryValue,
  fileName: string,
  isToken: boolean = false,
  isUser: boolean = false,
): Promise<string | null> => {
  const trimmedName: string = fileName.trim().replace(" ", "");

  try {
    const { data, error } = await supabase.storage
      .from(`${isToken ? "tokens" : isUser ? "users" : "startups"}`)
      .upload(`${trimmedName}`, image, {
        cacheControl: "3600",
        upsert: false,
        contentType: "*",
      });

    if (error) {
      console.log("error uploading image to supabase", error, error.message);
      return null;
    }

    const { data: imageUrl } = await supabase.storage
      .from(`${isToken ? "tokens" : isUser ? "users" : "startups"}`)
      .getPublicUrl(data.path);

    return imageUrl.publicUrl;
  } catch (err: any) {
    throw new Response(
      JSON.stringify({
        message: err,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
};

// Register user function
const registerUser = async (req: Request): Promise<Response> => {
  const data = await req.formData();
  const name = data.get("name") as string;
  const email = data.get("email");
  const password = data.get("password");
  const photo = data.get("photo");

  // Check required fields
  if (!email || !password || !name) {
    return new Response(
      JSON.stringify({
        message: "All fields are required: email, password, name",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    // Create a Solana wallet
    const { publicKey: walletPublicKey, secretKey: walletSecretKey } =
      createWallet();

    // Sign up user using Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email as string,
      password: password as string,
    });

    // If there's an authentication error, return it
    if (authError) {
      throw new Error(authError.message);
    }

    //TODO fix this
    let userPhoto = null;
    if (photo) {
      // If a photo is provided, upload it and get the URL
      userPhoto = await supabaseImageUploader(photo, name, false, true);
    }

    // Insert user data into the 'users' table
    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user?.id,
          name,
          wallet_public_key: walletPublicKey,
          wallet_secret_key: walletSecretKey,
          email,
          photo: userPhoto,
        },
      ]);

    // If there's an error inserting the user, return it
    if (insertError) {
      throw new Error(`Supabase insert error -> ${insertError.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ error: false, message: "User registered successfully" }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );

    //TODO send an activation email when necessary for now no.
  } catch (error) {
    console.error("Error registering user:", error);

    // Return error response
    return new Response(
      JSON.stringify({ error: true, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

// Serve the edge function
Deno.serve((req: Request) => registerUser(req));
