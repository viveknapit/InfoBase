// features/Comments/AddCommentForm.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { createCommentForAnswer, createCommentForQuestion } from "../../redux/slices/CommentSlice";

type Props = {
  contentType: 'question' | 'answer';
  parentId: number;
  onSuccess?: () => void;
};

export default function AddCommentForm({ contentType, parentId, onSuccess }: Props) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Build payload according to contentType
    const payload: any = { text: text.trim() };
    if (contentType === 'question') payload.parentId = parentId;
    else payload.parentId = parentId;

    try {
      setSubmitting(true);
      if (contentType === 'question') {
        await dispatch(createCommentForQuestion(payload)).unwrap();
      } else {
        await dispatch(createCommentForAnswer(payload)).unwrap();
      }
      setText("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm">
      <label className="text-sm font-medium text-gray-700">Add a comment</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mt-2 w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        placeholder="Write your comment..."
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-400">Be respectful — follow community guidelines</div>
        <button
          type="submit"
          disabled={submitting}
          className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 text-sm"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
