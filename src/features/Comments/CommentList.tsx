// features/Comments/CommentList.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import type { RootState } from "../../redux/store";
import {
  fetchCommentsForQuestion,
  fetchCommentsForAnswer,
  selectCommentsForQuestion,
  selectCommentsForAnswer
} from "../../redux/slices/CommentSlice";
import CommentCard from "./CommentCard";

export default function CommentList({ contentType, parentId }: { contentType: 'question' | 'answer'; parentId: number; }) {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.comments.loading);
  const error = useSelector((s: RootState) => s.comments.error);

  const comments = useSelector((s: RootState) =>
    contentType === 'question'
      ? selectCommentsForQuestion(s, parentId)
      : selectCommentsForAnswer(s, parentId)
  );

  useEffect(() => {
    if (isNaN(parentId)) return;
    if (contentType === 'question') dispatch(fetchCommentsForQuestion(parentId));
    else dispatch(fetchCommentsForAnswer(parentId));
  }, [dispatch, contentType, parentId]);

  if (loading && comments.length === 0) return <div className="p-4 bg-white rounded">Loading comments...</div>;
  if (error) return <div className="p-4 bg-red-50 rounded text-red-600">Error loading comments: {error}</div>;
  if (comments.length === 0) return <div className="p-4 bg-white rounded text-sm text-gray-600">No comments yet. Be the first to comment!</div>;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} />
      ))}
    </div>
  );
}
