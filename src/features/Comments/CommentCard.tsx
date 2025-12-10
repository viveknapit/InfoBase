import type { Comment } from "../../services/Payload";

/** Lightweight time-ago formatter */
function timeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 5) return "just now";
  if (diff < 60) return `${diff} seconds ago`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
          {comment.user.name ? comment.user.name.charAt(0).toUpperCase() : "U"}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">
              {comment.user.name || "Unknown"}
            </div>
            <div className="text-xs text-gray-400">
              {timeAgo(comment.createdAt)}
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
            {comment.text}
          </p>
        </div>
      </div>
    </div>
  );
}
