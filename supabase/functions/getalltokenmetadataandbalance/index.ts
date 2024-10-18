import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { clusterApiUrl, Connection, PublicKey } from "npm:@solana/web3.js";
import { Metaplex } from "npm:@metaplex-foundation/js";
import { getAssociatedTokenAddress } from "npm:@solana/spl-token";
import { config } from "npm:dotenv";
import { createClient } from "npm:@supabase/supabase-js";

// Load environment variables
config();

// Create Supabase client
const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!,
);

// Enum for HTTP Status Codes
enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  INTERNAL_SERVER = 500,
}

// Class to handle custom responses
class ResponseHandler extends Response {
  status: number;
  constructor(body: string, status: number) {
    super(body);
    this.status = status;
  }
}

// Function to establish connection with Solana Devnet
const getSolanaConnection = () => {
  try {
    return new Connection(clusterApiUrl("devnet"), "confirmed");
  } catch (err: any) {
    return new ResponseHandler(
      JSON.stringify({
        error: true,
        message: `Error initializing Solana connection: ${err}`,
      }),
      HttpStatusCode.INTERNAL_SERVER,
    );
  }
};

// Function to validate Base58 addresses
const isValidBase58 = (str: string): boolean => {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(str);
};

// Function to fetch the token balance and metadata for a given mint address and user
export const getTokenBalanceAndMetadata = async (
  mintAddress: string,
  userAddress: string,
): Promise<{ balance: number; metadata: any }> => {
  try {
    if (!isValidBase58(mintAddress) || !isValidBase58(userAddress)) {
      throw new Error("Invalid Base58 character in address");
    }

    const connection = getSolanaConnection()!;
    const mintPubKey = new PublicKey(mintAddress);
    const userPubKey = new PublicKey(userAddress);
    const con = connection as Connection;

    // Derive the user's associated token account address
    const userTokenAccountAddress = await getAssociatedTokenAddress(
      mintPubKey,
      userPubKey,
    );

    // Fetch the token balance
    const tokenAccountBalance = await con.getTokenAccountBalance(
      userTokenAccountAddress,
    );
    const balance = tokenAccountBalance.value.uiAmount || 0;

    // Initialize Metaplex SDK
    const metaplex = Metaplex.make(connection as Connection);

    // Fetch the token metadata
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubKey });

    // Extract metadata
    const metadata = nft
      ? {
        name: nft.name,
        symbol: nft.symbol,
        uri: nft.uri,
        description: nft.json?.description,
        image: nft.json?.image,
        attributes: nft.json?.attributes,
      }
      : null;

    return { balance, metadata };
  } catch (error: any) {
    console.error("Error fetching token balance or metadata:", error);
    throw new Error("Unable to fetch token balance or metadata");
  }
};

// Function to fetch all tokens' metadata and balances for a user
export const getUserTokensMetadata = async (userId: string) => {
  try {
    // Step 1: Query the Supabase "tokens" table to get all tokens' mint addresses
    const { data: userTokens, error } = await supabase
      .from("tokens")
      .select("mint_address, user_id(wallet_public_key))")
      .eq("user_id", userId);

    if (error || !userTokens) {
      throw new Error(
        `Error fetching tokens: ${error?.message || "None found"}`,
      );
    }

    // Step 2: Fetch balance and metadata for each mint address
    const tokenDetails = await Promise.all(
      userTokens.map(async (token: any) => {
        const { mint_address, user_id } = token;
        return await getTokenBalanceAndMetadata(
          mint_address,
          user_id.wallet_public_key,
        );
      }),
    );

    // Step 3: Return the data
    return new Response(
      JSON.stringify({ error: false, message: tokenDetails }),
      { status: HttpStatusCode.OK },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: `Failed to get tokens metadata: ${error.message}`,
      }),
      { status: HttpStatusCode.INTERNAL_SERVER },
    );
  }
};

// Function to handle incoming requests and serve the balance and metadata
const getBalanceAndMetadata = async (req: Request) => {
  try {
    // Extract query parameters from the URL
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: true, message: "userId is required" }),
        { status: HttpStatusCode.BAD_REQUEST },
      );
    }

    // Fetch the user's tokens metadata and balances
    return await getUserTokensMetadata(userId);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: true,
        message: `Failed to get the balance: ${err.message}`,
      }),
      { status: HttpStatusCode.INTERNAL_SERVER },
    );
  }
};

// Serve the function using Deno
Deno.serve((req: Request) => getBalanceAndMetadata(req));
