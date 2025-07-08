import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { address, createSolanaRpc } from "@solana/kit";
import type { Address } from "@solana/addresses";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { Import, RefreshCw, Send } from "lucide-react";
import { useEffect, useState } from "react";

// Type definitions for better TypeScript support
interface TokenAccount {
  pubkey: string;
  mint: string;
  owner: string;
  decimals: number;
  balance: number;
  rawBalance: string;
  name: string;
  symbol: string;
  address: string;
}

type ManageTokenProps = {
  wallet: WalletContextState;
};

export function ManageToken({ wallet }: ManageTokenProps) {
  // Separate state for different token programs
  const [legacyTokens, setLegacyTokens] = useState<TokenAccount[]>([]);
  const [token2022s, setToken2022s] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importAddress, setImportAddress] = useState<string>("");
  const [transferData, setTransferData] = useState<{
    tokenAddress: string;
    recipientAddress: string;
    amount: string;
  }>({
    tokenAddress: "",
    recipientAddress: "",
    amount: "",
  });

  // RPC configuration
  const rpc_url = "https://api.devnet.solana.com"; // Change to mainnet for production
  const rpc = createSolanaRpc(rpc_url);

  // Function to import a specific token by address
  const importToken = async () => {
    if (!importAddress || !wallet?.publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const owner = address(wallet.publicKey.toString());
      const mint = address(importAddress);

      // Try both token programs
      const [legacyResponse, token2022Response] = await Promise.all([
        rpc
          .getTokenAccountsByOwner(owner, { mint }, { encoding: "jsonParsed" })
          .send(),
        rpc
          .getTokenAccountsByOwner(owner, { mint }, { encoding: "jsonParsed" })
          .send(),
      ]);

      let foundToken = false;

      // Check legacy token program
      if (legacyResponse.value.length > 0) {
        const accountInfo = legacyResponse.value[0];
        const parsed = accountInfo.account.data.parsed.info;

        const newToken: TokenAccount = {
          pubkey: accountInfo.pubkey,
          mint: parsed.mint,
          owner: parsed.owner,
          decimals: parsed.tokenAmount.decimals,
          balance:
            parseFloat(parsed.tokenAmount.amount) /
            Math.pow(10, parsed.tokenAmount.decimals),
          rawBalance: parsed.tokenAmount.amount,
          name: `Token ${parsed.mint.slice(0, 8)}...`,
          symbol: `TKN`,
          address: parsed.mint,
        };

        // Check if token already exists in legacy tokens
        const tokenExists = legacyTokens.some(
          (token) => token.address === newToken.address
        );

        if (!tokenExists) {
          setLegacyTokens((prevTokens) => [...prevTokens, newToken]);
          foundToken = true;
        }
      }

      // Check Token 2022 program
      if (token2022Response.value.length > 0) {
        const accountInfo = token2022Response.value[0];
        const parsed = accountInfo.account.data.parsed.info;

        const newToken: TokenAccount = {
          pubkey: accountInfo.pubkey,
          mint: parsed.mint,
          owner: parsed.owner,
          decimals: parsed.tokenAmount.decimals,
          balance:
            parseFloat(parsed.tokenAmount.amount) /
            Math.pow(10, parsed.tokenAmount.decimals),
          rawBalance: parsed.tokenAmount.amount,
          name: `Token ${parsed.mint.slice(0, 8)}...`,
          symbol: `TKN`,
          address: parsed.mint,
        };

        // Check if token already exists in token 2022 list
        const tokenExists = token2022s.some(
          (token) => token.address === newToken.address
        );

        if (!tokenExists) {
          setToken2022s((prevTokens) => [...prevTokens, newToken]);
          foundToken = true;
        }
      }

      if (!foundToken) {
        setError(
          "No token account found for this address. You may need to create an associated token account first."
        );
        return;
      }

      setImportAddress("");
    } catch (err) {
      console.error("Error importing token:", err);
      setError(
        "Failed to import token. Please check the address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to transfer tokens
  const transferToken = async () => {
    if (
      !transferData.tokenAddress ||
      !transferData.recipientAddress ||
      !transferData.amount
    )
      return;

    setLoading(true);
    setError(null);

    try {
      // This is a placeholder - you'll need to implement actual token transfer logic
      // using @solana/web3.js and @solana/spl-token
      console.log("Transferring token:", {
        tokenAddress: transferData.tokenAddress,
        recipientAddress: transferData.recipientAddress,
        amount: transferData.amount,
      });

      // After successful transfer, refresh the token list
      await fetchUserTokens(wallet);

      // Clear transfer data
      setTransferData({
        tokenAddress: "",
        recipientAddress: "",
        amount: "",
      });
    } catch (err) {
      console.error("Error transferring token:", err);
      setError("Failed to transfer token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Updated function to fetch tokens from both programs
  const fetchUserTokens = async (wallet: WalletContextState) => {
    if (!wallet.publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const owner = address(wallet.publicKey.toBase58().toString());

      // Fetch tokens from both programs simultaneously
      const [legacyResponse, token2022Response] = await Promise.all([
        rpc
          .getTokenAccountsByOwner(
            owner,
            { programId: TOKEN_PROGRAM_ADDRESS },
            { encoding: "jsonParsed" }
          )
          .send(),
        rpc
          .getTokenAccountsByOwner(
            owner,
            { programId: TOKEN_2022_PROGRAM_ID.toBase58() as Address },
            { encoding: "jsonParsed" }
          )
          .send(),
      ]);

      // Process legacy tokens
      const legacyTokenAccounts = legacyResponse.value.map((accountInfo) => {
        const parsed = accountInfo.account.data.parsed.info;
        return {
          pubkey: accountInfo.pubkey,
          mint: parsed.mint,
          owner: parsed.owner,
          decimals: parsed.tokenAmount.decimals,
          balance:
            parseFloat(parsed.tokenAmount.amount) /
            Math.pow(10, parsed.tokenAmount.decimals),
          rawBalance: parsed.tokenAmount.amount,
          name: `Token ${parsed.mint.slice(0, 8)}...`,
          symbol: `TKN`,
          address: parsed.mint,
        };
      });

      // Process Token 2022 tokens
      const token2022Accounts = token2022Response.value.map((accountInfo) => {
        const parsed = accountInfo.account.data.parsed.info;
        return {
          pubkey: accountInfo.pubkey,
          mint: parsed.mint,
          owner: parsed.owner,
          decimals: parsed.tokenAmount.decimals,
          balance:
            parseFloat(parsed.tokenAmount.amount) /
            Math.pow(10, parsed.tokenAmount.decimals),
          rawBalance: parsed.tokenAmount.amount,
          name: `Token ${parsed.mint.slice(0, 8)}...`,
          symbol: `T22`,
          address: parsed.mint,
        };
      });

      // Filter out tokens with zero balance (optional)
      const legacyTokensWithBalance = legacyTokenAccounts.filter(
        (token) => token.balance > 0
      );
      const token2022sWithBalance = token2022Accounts.filter(
        (token) => token.balance > 0
      );

      setLegacyTokens(legacyTokensWithBalance);
      setToken2022s(token2022sWithBalance);
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError("Failed to fetch tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch tokens when wallet connects
  useEffect(() => {
    if (wallet?.publicKey) {
      fetchUserTokens(wallet);
    }
  }, [wallet?.publicKey]);

  // Helper function to render token list
  const renderTokenList = (
    tokens: TokenAccount[],
    title: string,
    programType: string
  ) => (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
          {programType}
        </span>
      </div>

      {tokens.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No {programType} tokens found in your wallet
        </p>
      ) : (
        <div className="space-y-4">
          {tokens.map((token, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">
                    {token.name} ({token.symbol})
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">
                    {token.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Account: {token.pubkey}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {token.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: token.decimals,
                    })}
                  </p>
                  <p className="text-sm text-gray-400">Balance</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Recipient address"
                  value={
                    transferData.tokenAddress === token.address
                      ? transferData.recipientAddress
                      : ""
                  }
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      tokenAddress: token.address,
                      recipientAddress: e.target.value,
                    })
                  }
                  className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={
                    transferData.tokenAddress === token.address
                      ? transferData.amount
                      : ""
                  }
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      tokenAddress: token.address,
                      amount: e.target.value,
                    })
                  }
                  className="w-24 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={transferToken}
                  disabled={
                    transferData.tokenAddress !== token.address ||
                    !transferData.recipientAddress ||
                    !transferData.amount ||
                    parseFloat(transferData.amount) <= 0 ||
                    parseFloat(transferData.amount) > token.balance
                  }
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 py-2 px-4 rounded-lg font-medium transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Import Token */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Import className="w-5 h-5" />
          <span>Import Token</span>
        </h2>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Enter token address"
            value={importAddress}
            onChange={(e) => setImportAddress(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={importToken}
            disabled={!importAddress}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>

      {/* Global controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Token Management</h1>
        <button
          onClick={() => fetchUserTokens(wallet)}
          disabled={loading || !wallet?.publicKey}
          className="bg-gray-800 hover:bg-gray-600 py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading tokens...</span>
        </div>
      ) : !wallet?.publicKey ? (
        <p className="text-gray-400 text-center py-8">
          Please connect your wallet to view tokens
        </p>
      ) : (
        <div className="space-y-6">
          {/* Legacy Token Program tokens */}
          {renderTokenList(legacyTokens, "Legacy Tokens", "Token Program")}

          {/* Token 2022 Program tokens */}
          {renderTokenList(token2022s, "Token 2022", "Token 2022 Program")}
        </div>
      )}
    </div>
  );
}
