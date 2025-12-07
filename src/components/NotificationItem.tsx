import React from "react";
import { cn } from "../lib/utils";

export type NotificationItemProps = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon?: React.ReactNode;
  unread?: boolean;
  onClick?: (id: number) => void;
};

export default function NotificationItem({
  id,
  title,
  description,
  time,
  icon,
  unread = false,
  onClick,
}: NotificationItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(id);
      }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
        unread ? "bg-blue-50" : ""
      )}
    >
      <div className="mt-1 flex-shrink-0">{icon ?? <div className="h-6 w-6 rounded bg-gray-200" />}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5 truncate">{description}</p>
        <p className="text-[10px] text-gray-400 mt-1">{time}</p>
      </div>

      {unread && <span className="h-2 w-2 bg-blue-600 rounded-full mt-2 ml-2" aria-hidden />}
    </div>
  );
}
