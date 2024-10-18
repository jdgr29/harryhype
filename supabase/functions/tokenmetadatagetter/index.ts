import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { clusterApiUrl, Connection, PublicKey } from "npm:@solana/web3.js";
import { Metaplex } from "npm:@metaplex-foundation/js";
import { getAssociatedTokenAddress } from "npm:@solana/spl-token";
import { config } from "npm:dotenv";

config();

enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UN_AUTH = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

class ResponseHandler extends Response {
  status: number;
  constructor(body: string, status: number) {
    super(body);
    this.status = status;
  }
}

const getSolanaConnection = () => {
  try {
    return new Connection(clusterApiUrl("devnet"), "confirmed");
  } catch (err: any) {
    return new ResponseHandler(
      JSON.stringify({
        error: true,
        message: `error getting or initializing solana connection ${err}`,
      }),
      HttpStatusCode.INTERNAL_SERVER,
    );
  }
};

export const getTokenBalanceAndMetadata = async (
  mintAddress: string,
  userAddress: string,
): Promise<{ balance: number; metadata: any }> => {
  try {
    const connection = getSolanaConnection()!;
    const mintPubKey = new PublicKey(mintAddress);
    const userPubKey = new PublicKey(userAddress);

    // Fetch the user's associated token account address
    const userTokenAccountAddress = await getAssociatedTokenAddress(
      mintPubKey,
      userPubKey,
    );
    console.log("User token account:", userTokenAccountAddress.toBase58());

    // Fetch the token balance
    const tokenAccountBalance = await connection.getTokenAccountBalance(
      userTokenAccountAddress,
    );
    const balance = tokenAccountBalance.value.uiAmount || 0;

    // Initialize Metaplex SDK
    const metaplex = Metaplex.make(connection as Connection);

    // Fetch the token metadata
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubKey });

    // Extract relevant metadata details
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
const getBalanceAndMetadata = async (req: Request) => {
  try {
    // Extract query parameters from the URL
    const url = new URL(req.url);
    const mint = url.searchParams.get("mint");
    const userWallet = url.searchParams.get("userWallet");

    if (!mint) {
      return new Response(
        JSON.stringify({ error: true, message: "mintAddress is required" }),
        { status: HttpStatusCode.BAD_REQUEST },
      );
    }

    if (!userWallet) {
      return new Response(
        JSON.stringify({ error: true, message: "userWallet is required" }),
        { status: HttpStatusCode.BAD_REQUEST },
      );
    }

    // Call a hypothetical function to get balance and metadata
    const balance = await getTokenBalanceAndMetadata(mint, userWallet);

    if (!balance) {
      return new Response(
        JSON.stringify({ error: true, message: "Balance not found" }),
        { status: HttpStatusCode.NOT_FOUND },
      );
    }

    return new Response(
      JSON.stringify({ error: false, message: balance }),
      { status: HttpStatusCode.OK },
    );
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
