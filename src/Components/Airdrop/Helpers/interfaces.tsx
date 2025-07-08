export interface Notification {
  type: "success" | "error";
  message: string;
}
export interface AirdropProps {
  airdropAmount: string;
  setAirdropAmount: (value: string) => void;
  isAirdropping: boolean;
  airdropSol: () => Promise<void>;
  notification: Notification | null;
  hideNotification: () => void;
}

export interface NotificationProps {
  notification: Notification | null;
  hideNotification: () => void;
}
