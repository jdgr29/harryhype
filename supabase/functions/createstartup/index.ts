import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "npm:@solana/web3.js";
import {
  createAssociatedTokenAccount,
  createMint,
  TOKEN_PROGRAM_ID,
} from "npm:@solana/spl-token";
import { createClient } from "npm:@supabase/supabase-js";
import * as metaplexMetadata from "npm:@metaplex-foundation/mpl-token-metadata@2.13.0";
import { Buffer } from "node:buffer";
import { config } from "npm:dotenv";
import bs58 from "npm:bs58";

config();
const { createCreateMetadataAccountV3Instruction } = metaplexMetadata;
const getSolanaConnection = () => {
  try {
    return new Connection(clusterApiUrl("devnet"), "confirmed");
  } catch (err: any) {
    console.log("something wrong getting solana connection", err);
  }
};
const supabase = createClient(
  Deno.env.get("URL")!,
  Deno.env.get("SERVICE_ROLE_KEY")!,
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey( //Metaplex SmartContract/Program Id
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

const systemWallet = Keypair.fromSecretKey(
  bs58.decode(Deno.env.get("SYSTEM_WALLET_SECRET_KEY")!),
);

type CreateStartupService = {
  name: FormDataEntryValue;
  description: FormDataEntryValue;
  startup_image: FormDataEntryValue | null;
  userId: string | undefined;
};

const createStartUpService = async (
  startUpData: CreateStartupService,
) => {
  const { name, description, startup_image, userId } = startUpData;

  try {
    const { error, data } = await supabase
      .from("startups")
      .insert([
        {
          name,
          description,
          startup_image,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Error creating startup ${error.message}`);
    }
    return data;
  } catch (err) {
    throw err;
  }
};

const supabaseImageUploader = async (
  image: Buffer | FormData | FormDataEntryValue,
  fileName: string | FormDataEntryValue,
  isToken: boolean = false,
  isUser: boolean = false,
): Promise<string | null> => {
  // Function to generate a random string of a given length using slice()
  const generateRandomString = (length: number) => {
    return Math.random().toString(36).slice(2, 2 + length); // Generate alphanumeric characters
  };

  // Function to sanitize the file name: removes accents and special characters
  const sanitizeFileName = (fileName: string) => {
    return fileName
      .normalize("NFD") // Normalize to NFD form to split accented characters
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-zA-Z0-9]/g, "_"); // Replace non-alphanumeric characters with underscores
  };

  const sanitizedFileName = sanitizeFileName(fileName?.trim()); // Trim and sanitize
  const randomString = generateRandomString(8); // Generates an 8-character random string

  // Append the random string to the sanitized file name to ensure uniqueness
  const uniqueFileName: string = `${sanitizedFileName}_${randomString}`;

  try {
    const { data, error } = await supabase.storage
      .from(`${isToken ? "tokens" : isUser ? "users" : "startups"}`)
      .upload(`${uniqueFileName}`, image, {
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

type AddMetaData = {
  mint: PublicKey;
  token_name: string | FormDataEntryValue;
  symbol: string | FormDataEntryValue;
  token_image: string | FormDataEntryValue;
  userWallet: { publicKey: string; secretKey: string };
};

const addMetadata = async ({
  mint,
  token_name,
  symbol,
  token_image,
  userWallet,
}: AddMetaData) => {
  try {
    const connection = getSolanaConnection()!;
    const metadataData = {
      name: token_name,
      symbol,
      uri: token_image,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    const metadataPDAAndBump = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    const metadataPDA = metadataPDAAndBump[0];

    const transaction = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: new PublicKey(mint),
          mintAuthority: new PublicKey(userWallet.publicKey),
          payer: systemWallet.publicKey,
          updateAuthority: new PublicKey(userWallet.publicKey),
        },
        {
          createMetadataAccountArgsV3: {
            collectionDetails: null,
            data: metadataData as metaplexMetadata.DataV2,
            isMutable: true,
          },
        },
      ),
    );

    const secretKeyUint8Array = Uint8Array.from(
      Buffer.from(userWallet.secretKey, "base64"),
    );

    const userKeypair = Keypair.fromSecretKey(secretKeyUint8Array);

    const transactionSent = await sendAndConfirmTransaction(
      connection,
      transaction,
      [systemWallet, userKeypair],
    );
    if (transactionSent) {
      console.log("Metadata added successfully.");
      return { signature: transactionSent };
    }
    return null;
  } catch (error: any) {
    console.error("Error adding metadata:", error);
    throw new Error("Error adding metadata: " + error.message);
  }
};

type CreateToken = {
  symbol: FormDataEntryValue;
  token_image: FormDataEntryValue;
  token_name: FormDataEntryValue;
  userWallet: { publicKey: string; secretKey: string };
};
const createToken = async ({
  symbol,
  token_image,
  token_name,
  userWallet,
}: CreateToken) => {
  const DECIMALS = 2;
  const userPublicKey = new PublicKey(userWallet.publicKey);
  const connection = getSolanaConnection()!;
  try {
    const mint = await createMint(
      connection,
      systemWallet, // System wallet pays for the transaction fees
      userPublicKey, // User is the mint authority
      null, // No freeze authority
      DECIMALS,
      undefined,
      {},
      TOKEN_PROGRAM_ID,
    );

    const token_image_url = await supabaseImageUploader(
      token_image,
      token_name,
      true,
    );
    const metaDataAdded = await addMetadata({
      mint,
      token_name,
      symbol,
      token_image: token_image_url!,
      userWallet,
    });

    const tokenAccount = await createAssociatedTokenAccount(
      connection,
      systemWallet,
      mint,
      userPublicKey,
    );

    return {
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.toBase58(),
      signature: metaDataAdded?.signature,
      token_image: token_image_url,
    };
  } catch (error: any) {
    console.error("Error creating token:", error);
    throw new Error("Error creating token: " + error.message);
  }
};

type RegisterTokenToSupabaseResponse = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  shares: null | number;
  token: string;
  startup_image: string;
  token_account: string;
};

const registerTokenToSupabase = async (
  tokenData: {
    id?: string;
    startup_id: string;
    mint_address: string;
    user_id: string;
    signature?: string | null;
  },
): Promise<RegisterTokenToSupabaseResponse> => {
  try {
    const { data, error } = await supabase
      .from("tokens")
      .insert([
        {
          startup_id: tokenData.startup_id,
          mint_address: tokenData.mint_address,
          user_id: tokenData.user_id,
          signature: tokenData.signature,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }
    return data[0];
  } catch (err: any) {
    console.log("error in createToken service", err);
    throw new Error(
      `error in createToken service ${err} ${err?.message}`,
    );
  }
};

type UpdateData = {
  user_id: string;
  token: string;
  token_account: string;
  startup_image: string | null;
  startup_id: string;
};

export const updateStartUpWithToken = async (updateData: UpdateData) => {
  const { startup_id, ...updates } = updateData;
  try {
    const { data, error } = await supabase
      .from("startups")
      .update(updates)
      .eq("id", updateData.startup_id)
      .select();
    if (error) {
      throw new Error(
        `Error updating startup with token ${error} | ${error.message}`,
      );
    }

    return data;
  } catch (err) {
    throw new Error(
      `error updateStartupWitnToken ${err}`,
    );
  }
};

const createStartUp = async (
  req: Request,
) => {
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
      throw new Error(
        `Invalid token or user not found ${error.message}${error}`,
      );
    }

    const { error: foundError, data: foundUser } = await supabase.from("users")
      .select("*").eq("id", userAuthenticated?.id).single();
    if (foundError) {
      throw new Error(
        `Invalid token or user not found ${foundError.message}${foundError}`,
      );
    }
    userId = userAuthenticated?.id; // Get the user ID from the token
    user = foundUser;
  } else {
    throw new Error("No authorization token provided");
  }

  if (!user) {
    throw new Error(
      "No se ha encontrado usuario para crear esta startup",
    );
  }
  const startupData = await req.formData();
  const name = startupData.get("name");
  const description = startupData.get("description");
  const token_name = startupData.get("token_name");
  const token_symbol = startupData.get("token_symbol");
  const token_image = startupData.get("token_image");
  const startup_image = startupData.get("startup_image");

  try {
    if (!token_image) {
      throw new Error(
        "Es necesario colocar un icono o imagen para tus shares!",
      );
    }
    if (!name) {
      throw new Error(
        "Es necesario colocar el nombre del startUp",
      );
    }
    if (!token_name) {
      throw new Error(
        "Es necesario colocar el nombre de las shares",
      );
    }

    if (!description) {
      throw new Error(
        "Necesitamos una description de tu startUp",
      );
    }

    if (!token_symbol) {
      throw new Error(
        "Necesitamos un símbolo para tus shares",
      );
    }
    const dataForStartup = {
      name,
      description,
      startup_image,
      userId,
    };

    const startUp = await createStartUpService(dataForStartup);

    const tokenInfo: {
      symbol: FormDataEntryValue;
      token_image: FormDataEntryValue;
      token_name: FormDataEntryValue;
      userWallet: { publicKey: string; secretKey: string };
    } = {
      symbol: token_symbol,
      token_name: token_name,
      token_image,
      userWallet: {
        publicKey: user.wallet_public_key,
        secretKey: user.wallet_secret_key,
      },
    };

    const tokenCreated = await createToken(tokenInfo);

    const registeredTokenToSupabase = await registerTokenToSupabase({
      user_id: user.id,
      startup_id: startUp[0].id,
      mint_address: tokenCreated.mint,
      signature: tokenCreated.signature,
    });

    if (!startUp) {
      throw new Error(
        "Ha ocurrido un problema creando la startup",
      );
    }

    let startupImageUrl = null;

    if (startup_image) {
      const imageUrl = await supabaseImageUploader(
        startup_image,
        name,
        false,
      );

      console.log("startup image url", imageUrl);

      startupImageUrl = imageUrl;
    }
    const companyUpdate = await updateStartUpWithToken({
      user_id: user.id,
      startup_id: startUp[0].id,
      token: registeredTokenToSupabase.id,
      token_account: tokenCreated.tokenAccount,
      startup_image: startupImageUrl!, // Use the public URL if the image was uploaded
    });

    if (!companyUpdate) {
      throw new Error(
        "Something went wrong updating the company with the token shares",
      );
    }

    return new Response(
      JSON.stringify({ error: false, message: companyUpdate }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.log("error", err);
    return new Response(
      JSON.stringify({ error: true, message: err }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

Deno.serve((req: Request) => createStartUp(req));
