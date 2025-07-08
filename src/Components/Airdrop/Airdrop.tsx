import { Zap } from "lucide-react";
import { type AirdropProps } from "./Helpers/interfaces";
import { Notification } from "./Helpers/Notification";

export function Airdrop({
  airdropAmount,
  setAirdropAmount,
  isAirdropping,
  airdropSol,
  notification,
  hideNotification,
}: AirdropProps) {
  return (
    <>
      {/*//////////////////////////////////////////////////////////////
                                  AIRDROP SECTION
          //////////////////////////////////////////////////////////////*/}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 my-3">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Devnet SOL Airdrop</h2>
        </div>

        <p className="text-gray-400 mb-6">
          Get free SOL for testing on Solana devnet
        </p>

        <div className="flex gap-3 mb-4">
          <input
            type="number"
            value={airdropAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAirdropAmount(e.target.value)
            }
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0.1"
            max="5"
            step="0.1"
          />
          <button
            onClick={airdropSol}
            disabled={isAirdropping}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isAirdropping ? "Airdropping..." : "Airdrop SOL"}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Max 5 SOL per airdrop • Devnet only
        </p>
      </div>

      {/* Bottom-left notification popup */}
      {notification && (
        <Notification
          notification={notification}
          hideNotification={hideNotification}
        />
      )}
    </>
  );
}
