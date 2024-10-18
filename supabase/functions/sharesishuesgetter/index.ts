import { clusterApiUrl, Connection, PublicKey } from "npm:@solana/web3.js";
import { getMint } from "npm:@solana/spl-token";

// Function to create Solana connection
export const getSolanaConnection = (): Connection | null => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    return connection;
  } catch (err: any) {
    console.error("Error getting Solana connection:", err);
    return null;
  }
};

// Main function to handle token supply retrieval
const getIssuedSharesSupply = async (req: Request): Promise<Response> => {
  try {
    const { mintAddress } = await req.json();
    const connection = getSolanaConnection();

    // Validate input and connection
    if (!mintAddress) {
      return new Response(
        JSON.stringify({ error: true, message: "Mint address is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 },
      );
    }
    if (!connection) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Could not establish connection to Solana",
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 },
      );
    }

    // Get mint info using the provided mint address
    const mint = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mint);

    // Check if mintInfo exists and retrieve supply
    if (mintInfo) {
      const totalSupplyRaw = mintInfo.supply; // Raw supply
      const decimals = mintInfo.decimals; // Token decimals

      // Calculate the actual supply (adjusting for decimals)
      const actualSupply = Number(totalSupplyRaw) / 10 ** decimals;

      console.log("Mint Info:", mintInfo);

      // Return the supply of issued shares/tokens as a properly formatted number
      return new Response(
        JSON.stringify({
          error: false,
          supply: actualSupply, // Return the calculated actual supply
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 },
      );
    } else {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Could not retrieve mint info",
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 },
      );
    }
  } catch (err: any) {
    console.error("Error retrieving issued shares supply:", err);
    return new Response(
      JSON.stringify({ error: true, message: "Internal server error" }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
};

// Serve the function
Deno.serve((req: Request) => getIssuedSharesSupply(req));
