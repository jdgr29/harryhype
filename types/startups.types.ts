export type RegisterStartupData = {
  name: string;
  description: string;
  startup_image: string;
  userId: string;
};

export type Startup = {
  id: string;
  user_id: UserId;
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
  likes: number;
  telephone_number: string;
  website: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
};

type UserId = {
  email: string;
  id: string;
  name: string;
  photo: string | null;
  wallet_public_key: string;
  wallet_secret_key: string;
  website: string | null;
  whatsapp: string | null;
};

export type StartUpShareData = {
  mintAddress: string;
  startup_id: string;
  token_image: string;
};
