import { Wallet, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { type WalletContextState } from "@solana/wallet-adapter-react";
import { createSolanaRpc, type Address } from "@solana/kit";
const rpc = createSolanaRpc("https://api.devnet.solana.com");
import { Connection } from "@solana/web3.js";
interface WalletInfoProps {
  copied: boolean;
  copyAddress: () => Promise<void>;
  wallet: WalletContextState;
}

export function WalletCard({ copied, copyAddress, wallet }: WalletInfoProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const connection = new Connection("https://api.devnet.solana.com");
  useEffect(() => {
    if (!wallet.publicKey) return;
    const publicKey = wallet.publicKey;
    let subscriptionId: number;
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const { value } = await rpc
          .getBalance(wallet.publicKey?.toBase58() as Address)
          .send();
        setBalance(Number(value) / 1_000_000_000);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    subscriptionId = connection.onAccountChange(
      publicKey,
      async (accountInfo) => {
        setBalance(accountInfo.lamports / 1_000_000_000);
      }
    );
    return () => {
      if (subscriptionId) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [wallet.publicKey]);

  return (
    <div className="bg-gray-900 p-6 mb-3 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-100 text-sm py-1">Connected Wallet</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy address"
              >
                <div className="text-xs  hover:text-purple-400  text-gray-400 font-mono flex">
                  <p className=" pr-2">
                    {wallet.publicKey?.toString().slice(0, 8)}...
                    {wallet.publicKey?.toString().slice(-8)}
                  </p>
                  <Copy className="w-4 h-4 " />
                </div>
              </button>
              {copied && (
                <span className="text-purple-400 text-sm">Copied!</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">SOL Balance</p>
            {loading ? (
              <p>Loading ...</p>
            ) : balance !== null ? (
              <p> {balance} SOL</p>
            ) : (
              <p>Error fetching balance</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
