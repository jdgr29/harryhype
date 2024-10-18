import { PublicKey } from '@solana/web3.js'

export type AddMetaData = {
	mint: PublicKey
	token_name: string
	symbol: string
	token_image: string
	userWallet: userWallet
}

export type Token = {
	id?: string
	startup_id: string
	mint_address: string
	user_id: string
	signature?: string | null
}

export type TransferToken = {
	mint: PublicKey
	source: PublicKey
	destination: PublicKey
	amount: number
}

export type CreateToken = {
	symbol: string
	token_image: Buffer
	token_name: string
	userWallet: userWallet
}

export type MintToken = {
	mint: PublicKey
	recipient: PublicKey
	amount: number
}

type userWallet = {
	publicKey: string
	secretKey: string
}
