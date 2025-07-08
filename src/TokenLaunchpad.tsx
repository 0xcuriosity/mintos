import { type JSX } from "react";
import { Wallet } from "lucide-react";
import { Solana } from "./assets/Sol";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MainContent } from "./Components/MainContents";

export default function TokenLaunchpad(): JSX.Element {
  const wallet = useWallet();
  const { connection } = useConnection();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className=" p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Solana />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent">
              Mintos
            </h1>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        {!wallet.publicKey ? (
          <div className="text-center py-20">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">
              Connect your Solana wallet to create and manage tokens
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <MainContent wallet={wallet} connection={connection} />
          </div>
        )}
      </main>
    </div>
  );
}
