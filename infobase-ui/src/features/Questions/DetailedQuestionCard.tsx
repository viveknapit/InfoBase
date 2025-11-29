// QuestionCard.connected.tsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store"; // adjust path if needed
import type { Question, User } from "../../redux/types"; // adjust path if needed
import {
  upvoteQuestion,
  upvoteQuestionOptimistic,
  fetchQuestionById,
} from "../../redux/slices/QuestionsSlice"; // adjust path if needed

type Props = {
  questionId: number;
  canEdit?: boolean;
  onShare?: (id: number) => void;
  onEdit?: (id: number) => void;
};

const Avatar: React.FC<{ user: User; size?: number }> = ({ user, size = 36 }) => {
  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "U";
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 overflow-hidden"
    >
      { (user as any)?.avatar || (user as any)?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={(user as any).avatar || (user as any).avatarUrl} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default function DetailedQuestionCard({ questionId, canEdit = false, onShare, onEdit }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch question once (and whenever questionId changes)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // dispatch thunk and unwrap to get payload
    dispatch(fetchQuestionById(questionId as number))
      .unwrap()
      .then((payload: any) => {
        if (!mounted) return;
        // thunk returns { questionId, question }
        setQuestion(payload.question ?? null);
      })
      .catch((err: any) => {
        console.error("fetchQuestionById error:", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load question");
        setQuestion(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, questionId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-sm text-gray-500">
        Loading question...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-sm text-red-600">
        Error loading question: {error}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-sm text-gray-500">
        Question not found.
      </div>
    );
  }

  const handleUpvote = async () => {
    // optimistic UI
    dispatch(upvoteQuestionOptimistic(questionId));

    // persist via thunk and unwrap to detect error quickly
    const res = await dispatch(upvoteQuestion(questionId as number)).unwrap().catch((err: any) => {
      console.error("Upvote thunk failed:", err);
      return { error: err };
    });

    // if there was an error object returned, re-fetch to restore accurate state
    if ((res as any)?.error) {
      // re-fetch question
      dispatch(fetchQuestionById(questionId as number));
    } else {
      // if server returned updated question in payload, you can optionally update local state:
      // if your upvoteQuestion thunk returns the updated question, handle it here.
      // Example:
      // if (res?.question) setQuestion(res.question);
    }
  };

  return (
    <article className="bg-white rounded shadow-sm p-6 mb-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{question.title}</h1>

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Avatar user={question.author as User} size={36} />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-sm">{question.author?.name}</span>
                <span className="text-xs text-gray-500">{new Date((question as any).askedAt ?? question.askedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="hidden sm:block border-l h-6" />

            <div className="flex gap-3 items-center pl-3">
              <div className="text-xs text-gray-500">{(question as any).answers ?? question.answers} answers</div>
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div className="hidden sm:flex sm:flex-col sm:items-end sm:gap-2 text-xs text-gray-500">
          {question.tags && question.tags.length > 0 && (
            <div className="mt-1 flex gap-2">
              {question.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mt-4 prose max-w-none text-sm">
        <ReactMarkdown>{(question as any).description ?? question.description}</ReactMarkdown>
      </div>

      {/* Small-screen tags */}
      <div className="mt-4 sm:hidden">
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: votes at left-bottom, actions at right */}
      <div className="mt-4 border-t pt-4 flex items-center justify-between">
        {/* Votes */}
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className="px-3 py-1 rounded hover:bg-gray-100 text-sm focus:outline-none"
              aria-label="upvote"
            >
              ▲
            </button>

            <div className="text-sm font-semibold w-10 text-center">{(question as any).upvotes ?? question.upvotes}</div>

            <button
              onClick={() => {
                // for prototype, downvote can be implemented similarly if you add a thunk
              }}
              className="px-3 py-1 rounded hover:bg-gray-100 text-sm focus:outline-none"
              aria-label="downvote"
            >
              ▼
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onShare && (
            <button
              onClick={() => onShare(questionId)}
              className="px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 text-sm"
            >
              Share
            </button>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(questionId)}
              className="px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
