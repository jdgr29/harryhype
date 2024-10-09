import { CustomAxios } from "@/libs/axios";

export const getTokenMetadata = async ({
  mint,
  userTokenAddress,
}: {
  mint?: string;
  userTokenAddress: string;
}) => {
  try {
    const response = await CustomAxios.get(
      `/token/balance?mint=${mint}&userWallet=${userTokenAddress}`
    );

    return response.data?.message;
  } catch (err: any) {
    console.log("error getting token metadata", err?.message, err);
    return false;
  }
};
