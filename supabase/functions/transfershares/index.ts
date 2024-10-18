import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
} from "npm:@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
} from "npm:@solana/spl-token";
import bs58 from "npm:bs58";
import { config } from "npm:dotenv";
import { fromBase64 } from "npm:@cosmjs/encoding";

config();

const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!,
);

// Create system wallet from secret key
const systemWallet = Keypair.fromSecretKey(
  bs58.decode(Deno.env.get("SYSTEM_WALLET_SECRET_KEY")!),
);

enum HttpStatusCodes {
  OK = 200,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  INTERNAL_SERVER = 500,
}

class ResponseHandler extends Response {
  constructor(body: string, status: number) {
    super(body, {
      status,
    });
  }
}

const getSolanaConnection = () => {
  try {
    return new Connection(clusterApiUrl("devnet"), "confirmed");
  } catch (err: any) {
    return new ResponseHandler(
      JSON.stringify({
        error: true,
        message: `Error getting or initializing Solana connection: ${err}`,
      }),
      HttpStatusCodes.INTERNAL_SERVER,
    );
  }
};

// Function to transfer tokens
const transferTokens = async (
  sender: Keypair,
  recipientPublicKey: PublicKey,
  mintAddress: PublicKey,
  amount: number,
) => {
  const connection = getSolanaConnection()!;

  // Get the associated token address for the sender
  const senderTokenAddress = await getOrCreateAssociatedTokenAccount(
    connection as Connection,
    systemWallet,
    mintAddress,
    sender.publicKey,
    false,
    "confirmed",
    {},
  );

  // Get the associated token address for the recipient
  const recipientTokenAddress = await getOrCreateAssociatedTokenAccount(
    connection as Connection,
    systemWallet,
    mintAddress,
    recipientPublicKey,
    false,
    "confirmed",
    {},
  );

  // Transfer tokens from the sender's token account to the recipient's token account
  const transactionSignature = await transfer(
    connection as Connection,
    systemWallet,
    senderTokenAddress.address, // Sender's token account
    recipientTokenAddress.address, // Recipient's token account
    sender.publicKey, // Owner of the source token account
    amount * 100, // Amount to transfer
    [sender], // Signer
  );

  return transactionSignature; // Return the transaction signature
};

// Supabase function to handle transfer requests
const handleTransferRequest = async (req: Request) => {
  try {
    // Validate the request headers for authentication
    let userId = null;
    let senderPrivateKey = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1]; // Assuming "Bearer TOKEN"
      const { data: { user: userAuthenticated }, error } = await supabase.auth
        .getUser(token);

      if (error) {
        return new ResponseHandler(
          JSON.stringify({ error: true, message: error.message }),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      const { data: userSender, error: userError } = await supabase.from(
        "users",
      ).select("*").eq("id", userAuthenticated?.id).single();

      if (userError) {
        return new ResponseHandler(
          JSON.stringify({ error: true, message: userError.message }),
          HttpStatusCodes.FORBIDDEN,
        );
      }

      userId = userAuthenticated?.id; // Get the user ID from the token
      senderPrivateKey = fromBase64(userSender?.wallet_secret_key);
    } else {
      return new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "No authorization token provided",
        }),
        HttpStatusCodes.FORBIDDEN,
      );
    }

    // Parse the request body
    const { receiver, amount, token_mint } = await req.json();
    if (!receiver || !amount || !token_mint) {
      return new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "receiver, amount, and token_mint are required",
        }),
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Validate receiver public key
    const recipientPublicKey = new PublicKey(receiver);
    const mintPublicKey = new PublicKey(token_mint);

    // Transfer tokens
    const transactionSignature = await transferTokens(
      Keypair.fromSecretKey(senderPrivateKey), // Use the user's private key as sender
      recipientPublicKey,
      mintPublicKey,
      amount,
    );

    const { data: token, error: tokenError, status } = await supabase.from(
      "tokens",
    ).select("*").eq(
      "mint_address",
      token_mint,
    ).single();

    if (tokenError) {
      return new ResponseHandler(
        JSON.stringify({ error: true, message: tokenError }),
        status,
      );
    }

    // Save transaction to Supabase
    const { error: transactionError } = await supabase.from("transactions")
      .insert([
        {
          sender: userId,
          receiver: receiver,
          amount: amount,
          token_id: token.id,
          user_id: userId,
          signature: transactionSignature, // Use the actual transaction signature
        },
      ]);

    if (transactionError) {
      return new ResponseHandler(
        JSON.stringify({
          error: true,
          message: "Error saving transaction: " + transactionError.message,
        }),
        HttpStatusCodes.INTERNAL_SERVER,
      );
    }

    return new ResponseHandler(
      JSON.stringify({ error: false, message: "Transfer successful" }),
      HttpStatusCodes.OK,
    );
  } catch (err) {
    return new ResponseHandler(
      JSON.stringify({
        error: true,
        message: `Something went wrong during the transfer: ${err}`,
      }),
      HttpStatusCodes.INTERNAL_SERVER,
    );
  }
};

// Start the Deno server
Deno.serve((req: Request) => handleTransferRequest(req));
