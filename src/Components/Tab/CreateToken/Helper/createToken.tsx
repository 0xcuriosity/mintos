import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { type CreateTokenForm } from "./interfaces";

// Make sure to use devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function createToken(
  form: CreateTokenForm,
  wallet: WalletContextState
) {
  if (!wallet.publicKey) {
    return;
  }

  // Log the connection endpoint to verify
  console.log("Using connection endpoint:", connection.rpcEndpoint);

  const mintKeypair = Keypair.generate();
  const metadata = {
    mint: mintKeypair.publicKey,
    name: form.name,
    symbol: form.symbol,
    uri: form.imageUrl,
    additionalMetadata: [],
  };

  const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMetadataPointerInstruction(
      mintKeypair.publicKey,
      wallet.publicKey,
      mintKeypair.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9,
      wallet.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      mint: mintKeypair.publicKey,
      metadata: mintKeypair.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: wallet.publicKey,
      updateAuthority: wallet.publicKey,
    })
  );

  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.partialSign(mintKeypair);

  // Send transaction using your devnet connection
  const signature = await wallet.sendTransaction(transaction, connection);

  // Wait for confirmation
  await connection.confirmTransaction(signature, "confirmed");

  console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
  console.log(`Transaction signature: ${signature}`);

  const associatedToken = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  console.log(`Associated token account: ${associatedToken.toBase58()}`);

  const transaction2 = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      associatedToken,
      wallet.publicKey,
      mintKeypair.publicKey,
      TOKEN_2022_PROGRAM_ID
    )
  );

  const signature2 = await wallet.sendTransaction(transaction2, connection);
  await connection.confirmTransaction(signature2, "confirmed");

  const transaction3 = new Transaction().add(
    createMintToInstruction(
      mintKeypair.publicKey,
      associatedToken,
      wallet.publicKey,
      1000000000, // 1 billion tokens (with 9 decimals = 1 token)
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const signature3 = await wallet.sendTransaction(transaction3, connection);
  await connection.confirmTransaction(signature3, "confirmed");

  console.log("Minted!");
  console.log(`Mint signatures: ${signature}, ${signature2}, ${signature3}`);

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    signatures: [signature, signature2, signature3],
  };
}
