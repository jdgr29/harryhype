export type TokenData = {
  balance: number;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  };
};

export type SupabaseTokenRecord = {
  arweave_json_uri: string | null;
  id: string;
  mint_address: string;
  signature: string;
  startup_id: string;
  user_id: string;
};
