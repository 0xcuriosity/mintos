import { useState } from "react";
import { type WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Airdrop } from "./Airdrop/Airdrop";
import { Tabs } from "./Tab/Tab";

interface Notification {
  type: "success" | "error";
  message: string;
}
import { WalletCard } from "./WalletCard/WalletCard";
interface MainArgs {
  wallet: WalletContextState;
  connection: Connection;
}
export function MainContent({ wallet, connection }: MainArgs) {
  const [airdropAmount, setAirdropAmount] = useState<string>("1");
  const [isAirdropping, setIsAirdropping] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const copyAddress = async (): Promise<void> => {
    if (wallet.publicKey) {
      await navigator.clipboard.writeText(wallet.publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const showNotification = (
    type: "success" | "error",
    message: string
  ): void => {
    setNotification({ type, message });
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const hideNotification = (): void => {
    setNotification(null);
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  async function airdropSol(): Promise<void> {
    if (!wallet.publicKey) {
      showNotification("error", "Connect Wallet to request airdrop.");
      return;
    }

    setIsAirdropping(true);

    try {
      const amount = Number(airdropAmount);
      await connection.requestAirdrop(
        wallet.publicKey,
        amount * LAMPORTS_PER_SOL
      );
      const truncatedAddress = truncateAddress(wallet.publicKey.toBase58());
      showNotification(
        "success",
        `Airdropped ${amount} SOL to ${truncatedAddress}`
      );
    } catch (error) {
      console.error("Airdrop failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showNotification("error", `Airdrop failed: ${errorMessage}`);
    } finally {
      setIsAirdropping(false);
    }
  }

  return (
    <>
      {/*////////////////////////////////////////////////////////////// 
                          WALLET  CARD SECTION
        //////////////////////////////////////////////////////////////*/}
      <WalletCard copied={copied} copyAddress={copyAddress} wallet={wallet} />
      {/*////////////////////////////////////////////////////////////// 
                          AIRDROP SECTION
       //////////////////////////////////////////////////////////////*/}
      <Airdrop
        airdropAmount={airdropAmount}
        setAirdropAmount={setAirdropAmount}
        isAirdropping={isAirdropping}
        airdropSol={airdropSol}
        notification={notification}
        hideNotification={hideNotification}
      />

      {/*//////////////////////////////////////////////////////////////
                              TABS SECTION
    //////////////////////////////////////////////////////////////*/}
      <Tabs wallet={wallet} />
    </>
  );
}
