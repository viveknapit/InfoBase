// components/CommentModal.tsx
import { useEffect } from "react";
import { X } from "lucide-react";
import AddCommentForm from "./AddCommentForm";
import CommentList from "./CommentList";

type Props = {
  contentType: 'question' | 'answer';
  parentId: number;
  open: boolean;
  onClose: () => void;
};

export default function CommentModal({ contentType, parentId, open, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-3xl mx-4 sm:mx-6 bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h3 className="text-lg font-semibold">Comments</h3>
          <button onClick={onClose} aria-label="Close comments" className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <AddCommentForm contentType={contentType} parentId={parentId} onSuccess={() => { /* keep open */ }} />
          <div className="border-t" />
          <CommentList contentType={contentType} parentId={parentId} />
        </div>

        <div className="p-3 bg-white border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
