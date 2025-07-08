import { useState } from "react";
import { ManageToken } from "./ManageToken/ManageToken";
import { CreateToken } from "./CreateToken/CreateTokenTab";
import type { WalletContextState } from "@solana/wallet-adapter-react";
type TabsProps = {
  wallet: WalletContextState;
};
export function Tabs({ wallet }: TabsProps) {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  return (
    <>
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg my-3">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            activeTab === "create"
              ? "bg-gradient-to-r from-slate-500 to-indigo-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Create Token
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            activeTab === "manage"
              ? "bg-gradient-to-r from-slate-500 to-indigo-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Manage Tokens
        </button>
      </div>

      {/* Create Token Section */}
      {activeTab === "create" && <CreateToken wallet={wallet} />}

      {/* Manage Tokens Section */}
      {activeTab === "manage" && <ManageToken wallet={wallet} />}
    </>
  );
}
