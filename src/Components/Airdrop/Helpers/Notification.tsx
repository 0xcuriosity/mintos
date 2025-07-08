import { CheckCircle, XCircle, X } from "lucide-react";
import { type NotificationProps } from "./interfaces";
export function Notification({
  notification,
  hideNotification,
}: NotificationProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
      <div
        className={`
              max-w-xs sm:max-w-sm rounded-lg shadow-lg border p-4 pr-12 relative
              ${
                notification?.type === "success"
                  ? "bg-green-900 border-green-700 text-green-100"
                  : "bg-red-900 border-red-700 text-red-100"
              }
            `}
      >
        <div className="flex items-start gap-3">
          {notification?.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium mb-1">
              {notification?.type === "success"
                ? "Airdrop Successful!"
                : "Airdrop Failed"}
            </p>
            <p className="text-sm opacity-90 break-all overflow-wrap-anywhere">
              {notification?.message}
            </p>
          </div>
        </div>
        <button
          onClick={hideNotification}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
