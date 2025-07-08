import { Plus } from "lucide-react";
import { useState } from "react";
import { type CreateTokenForm } from "./Helper/interfaces";
import { createToken } from "./Helper/createToken";
import type { WalletContextState } from "@solana/wallet-adapter-react";
interface CreateTokenArgs {
  wallet: WalletContextState;
}
export function CreateToken({ wallet }: CreateTokenArgs) {
  // Create Token Form
  const [createForm, setCreateForm] = useState<CreateTokenForm>({
    name: "",
    symbol: "",
    imageUrl: "",
    initialSupply: "1000000",
    decimals: "6",
    mintAuthority: "",
  });
  const handleCreateFormChange = (
    field: keyof CreateTokenForm,
    value: string
  ): void => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
        <Plus className="w-5 h-5" />
        <span>Create Custom Token</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Name
          </label>
          <input
            type="text"
            placeholder="My Awesome Token"
            value={createForm.name}
            onChange={(e) => handleCreateFormChange("name", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Symbol
          </label>
          <input
            type="text"
            placeholder="MAT"
            value={createForm.symbol}
            onChange={(e) =>
              handleCreateFormChange("symbol", e.target.value.toUpperCase())
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/token.png"
            value={createForm.imageUrl}
            onChange={(e) => handleCreateFormChange("imageUrl", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Initial Supply
          </label>
          <input
            type="number"
            placeholder="1000000"
            value={createForm.initialSupply}
            onChange={(e) =>
              handleCreateFormChange("initialSupply", e.target.value)
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Decimals
          </label>
          <input
            type="number"
            placeholder="6"
            value={createForm.decimals}
            onChange={(e) => handleCreateFormChange("decimals", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mint Authority
          </label>
          <input
            type="text"
            placeholder="Leave empty for wallet address"
            value={createForm.mintAuthority}
            onChange={(e) =>
              handleCreateFormChange("mintAuthority", e.target.value)
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      <button
        onClick={() => {
          createToken(createForm, wallet);
        }}
        disabled={!createForm.name || !createForm.symbol}
        className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        <span>Create Token</span>
      </button>
    </div>
  );
}
