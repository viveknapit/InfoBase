// src/data/notifications-data.tsx
import { MessageSquare, ArrowUp, Bell, PhoneCall, Gift } from "lucide-react";
import React from "react";

export type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon?: React.ReactNode;
  unread?: boolean;
};

export const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "New Answer",
    description: "Someone answered your question about CORS.",
    time: "2m ago",
    icon: <MessageSquare size={16} className="text-blue-600" />,
    unread: true,
  },
  {
    id: 2,
    title: "Upvote Received",
    description: "Your answer got 3 new upvotes!",
    time: "10m ago",
    icon: <ArrowUp size={16} className="text-green-600" />,
    unread: true,
  },
  {
    id: 3,
    title: "Session Reminder",
    description: "Your speaking session will start in 10 minutes.",
    time: "20m ago",
    icon: <PhoneCall size={16} className="text-indigo-600" />,
    unread: false,
  },
  {
    id: 4,
    title: "Reward Earned",
    description: "You earned 25 points for completing a session.",
    time: "1h ago",
    icon: <Gift size={16} className="text-yellow-600" />,
    unread: false,
  },
  {
    id: 5,
    title: "System Notice",
    description: "New features are live in beta.",
    time: "Yesterday",
    icon: <Bell size={16} className="text-gray-600" />,
    unread: false,
  },
];
