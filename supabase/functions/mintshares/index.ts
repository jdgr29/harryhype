import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
} from "npm:@solana/web3.js";
import { mintTo, TOKEN_PROGRAM_ID } from "npm:@solana/spl-token";
import bs58 from "npm:bs58";
import { config } from "npm:dotenv";
import { Buffer } from "node:buffer";
import console from "node:console";

config();
const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!,
);

const systemWallet = Keypair.fromSecretKey(
  bs58.decode(Deno.env.get("SYSTEM_WALLET_SECRET_KEY")!),
);

enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UN_AUTH = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

export type Startup = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  shares: number | null;
  token: {
    id: string;
    user_id: string;
    signature: string;
    startup_id: string;
    mint_address: string;
    arweave_json_uri: string | null;
  };
  startup_image: string;
  token_account: string;
};

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
      HttpStatusCodes.INTERNAL_SERVER,
    );
  }
};

export const findStartupById = async (
  startupId: string,
): Promise<Startup | null> => {
  try {
    const { data, status, error } = await supabase
      .from("startups")
      .select("*, token(*)")
      .eq("id", startupId)
      .single();
    if (error) {
      throw new ResponseHandler(
        `Error finding startup ${error.message}`,
        status,
      );
    }

    return data;
  } catch (err) {
    throw new ResponseHandler(
      `error in findStartupById function ${err}`,
      HttpStatusCodes.INTERNAL_SERVER,
    );
  }
};

const decodeBase64ToUint8Array = (base64String: string) => {
  const binaryString = Buffer.from(base64String, "base64").toString("binary");
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const mintShares = async ({
  shareMintTokenAddress,
  recipientSigner,
  amount,
  receiverTokenWalletAddress,
  userPrivateKey, // Base64 encoded private key
}: {
  shareMintTokenAddress: string;
  recipientSigner: string;
  amount: number;
  receiverTokenWalletAddress: string;
  userPrivateKey: string; // Base64 encoded string
}): Promise<string | null> => {
  try {
    const connection = getSolanaConnection()!;

    const userKeypair = Keypair.fromSecretKey(
      decodeBase64ToUint8Array(userPrivateKey),
    );

    const recipient = new PublicKey(receiverTokenWalletAddress);

    const mintPubKey = new PublicKey(shareMintTokenAddress);

    const txSignature = await mintTo(
      connection as Connection, // Solana connection
      systemWallet, // The wallet paying for the transaction (system wallet)
      mintPubKey, // The mint address of the token
      recipient, // The recipient of the minted tokens (user's wallet)
      userKeypair, // The authority allowed to mint tokens (user's keypair)
      amount * 100, // Amount of tokens to mint (adjusted for 2 decimals)
      [], // Additional signer(s) if necessary
      {},
      TOKEN_PROGRAM_ID, // Solana token program ID
    );

    return txSignature;
  } catch (error: any) {
    console.error("Error minting tokens:", error);
    throw new ResponseHandler(
      "Error minting tokens: " + error.message,
      HttpStatusCodes.INTERNAL_SERVER,
    );
  }
};

const sharesMinter = async (req: Request) => {
  try {
    let userId = null;
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1]; // Assuming "Bearer TOKEN"
      // Verify the token and get user details
      const { data: { user: userAuthenticated }, error } = await supabase.auth
        .getUser(
          token,
        );

      if (error) {
        return new ResponseHandler(
          JSON.stringify({ error: true, message: error }),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const { error: foundError, data: foundUser } = await supabase.from(
        "users",
      )
        .select("*").eq("id", userAuthenticated?.id).single();
      if (foundError) {
        throw new ResponseHandler(
          JSON.stringify({
            error: true,
            message:
              `Invalid token or user not found ${foundError.message}${foundError}`,
          }),
          HttpStatusCodes.BAD_REQUEST,
        );
      }
      userId = userAuthenticated?.id; // Get the user ID from the token
      user = foundUser;
    } else {
      throw new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "No authorization token provided",
        }),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    if (!user) {
      throw new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "No se ha encontrado usuario para crear esta startup",
        }),
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    if (!userId) {
      throw new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "There is no userId present on this request",
        }),
        HttpStatusCodes.FORBIDDEN,
      );
    }
    const { startup_id, amount_to_mint } = await req.json();
    if (!startup_id || !amount_to_mint) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "startup_id and amount_to_mint are necessary",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }
    const startup = await findStartupById(startup_id);

    if (!startup) {
      throw new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "the startup for this operation has not been found",
        }),
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const sharesData = {
      shareMintTokenAddress: startup.token.mint_address,
      recipientSigner: user.wallet_public_key,
      receiverTokenWalletAddress: startup.token_account,
      amount: amount_to_mint,
      userPrivateKey: user.wallet_secret_key,
    };

    const response = await mintShares(sharesData);

    if (!response) {
      throw new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "something went wrong minting the shares",
        }),
        HttpStatusCodes.INTERNAL_SERVER,
      );
    }

    return new ResponseHandler(
      JSON.stringify({ error: false, message: response }),
      HttpStatusCodes.OK,
    );
  } catch (err) {
    console.log("error minting tokens", err);
    return new ResponseHandler(
      JSON.stringify({
        error: true,
        message: `Something has gone wrong minting shares ${err}`,
      }),
      HttpStatusCodes.INTERNAL_SERVER,
    );
  }
};

Deno.serve((req: Request) => sharesMinter(req));
