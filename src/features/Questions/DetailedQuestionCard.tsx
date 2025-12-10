import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store"; 
import type { Question} from "../../redux/types";
import { selectCommentsForQuestion } from "../../redux/slices/CommentSlice";

import {
  upvoteQuestion,
  downvoteQuestion,
  upvoteQuestionOptimistic,
  downvoteQuestionOptimistic,
  revertUpvoteOptimistic,
  revertDownvoteOptimistic,
  fetchQuestionById,
  deleteQuestion,
} from "../../redux/slices/QuestionsSlice"; 
import type { UserShort } from "../../services/Payload";
import { isUserVotedToQuestion } from "../../services/QuestionService";

type Props = {
  questionId: number;
  canEdit?: boolean;
  onShare?: (id: number) => void;
  onEdit?: (id: number) => void;
  onOpenComments?: () => void; 
};

export const Avatar: React.FC<{ user: UserShort; size?: number }> = ({ user, size = 36 }) => {
  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "U";
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 overflow-hidden"
    >
      { (user as any)?.avatar || (user as any)?.avatarUrl ? (
        <img src={(user as any).avatar || (user as any).avatarUrl} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// Three Dots Menu Icon Component
const ThreeDotsIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

// Thumbs Up Icon Component
const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

// Thumbs Down Icon Component
const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default function DetailedQuestionCard({ questionId, canEdit = false, onShare, onEdit, onOpenComments}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoting, setIsUpvoting] = useState<boolean>(false);
  const [isDownvoting, setIsDownvoting] = useState<boolean>(false);
  const [voteStatus, setVoteStatus] = useState<number>(0); // 1: upvoted, -1: downvoted, 0: no vote
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const currentUserId = useSelector((state: RootState) => state.users.user!.id);


  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Fetch question data
    const fetchData = async () => {
      try {
        // Fetch question details
        const questionPayload = await dispatch(fetchQuestionById(questionId as number)).unwrap();
        if (!mounted) return;
        setQuestion(questionPayload.question ?? null);

        // Fetch user's vote status
        const userVoteStatus = await isUserVotedToQuestion(questionId);
        if (!mounted) return;
        setVoteStatus(userVoteStatus);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load question");
        setQuestion(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [dispatch, questionId]);

  const handleUpvote = async () => {
    if (isUpvoting || isDownvoting) return;
    
    const previousVoteStatus = voteStatus;
    const wasUpvoted = voteStatus === 1;
    const wasDownvoted = voteStatus === -1;
    
    setIsUpvoting(true);
    
    // Determine vote adjustment for optimistic update
    let voteAdjustment = 0;
    if (wasUpvoted) {
      // Removing upvote: 1 -> 0
      voteAdjustment = -1;
      setVoteStatus(0);
      dispatch(revertUpvoteOptimistic(questionId));
    } else if (wasDownvoted) {
      // Switching from downvote to upvote: -1 -> 1
      voteAdjustment = 2;
      setVoteStatus(1);
      dispatch(revertDownvoteOptimistic(questionId));
      dispatch(upvoteQuestionOptimistic(questionId));
    } else {
      // Adding upvote: 0 -> 1
      voteAdjustment = 1;
      setVoteStatus(1);
      dispatch(upvoteQuestionOptimistic(questionId));
    }
    
    // Update local state immediately for optimistic UI
    if (question) {
      setQuestion({
        ...question,
        votes: (question.votes || 0) + voteAdjustment
      });
    }

    try {
      await dispatch(upvoteQuestion(questionId as number)).unwrap();
      
      // Refetch to ensure data is in sync with server
      const result = await dispatch(fetchQuestionById(questionId as number)).unwrap();
      setQuestion(result.question ?? null);
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToQuestion(questionId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Upvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      if (question) {
        setQuestion({
          ...question,
          votes: (question.votes || 0) - voteAdjustment
        });
      }
      
      // Revert Redux state
      if (wasUpvoted) {
        dispatch(upvoteQuestionOptimistic(questionId));
      } else if (wasDownvoted) {
        dispatch(downvoteQuestionOptimistic(questionId));
        dispatch(revertUpvoteOptimistic(questionId));
      } else {
        dispatch(revertUpvoteOptimistic(questionId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isDownvoting || isUpvoting) return;
    
    const previousVoteStatus = voteStatus;
    const wasUpvoted = voteStatus === 1;
    const wasDownvoted = voteStatus === -1;
    
    setIsDownvoting(true);
    
    // Determine vote adjustment for optimistic update
    let voteAdjustment = 0;
    if (wasDownvoted) {
      // Removing downvote: -1 -> 0
      voteAdjustment = 1;
      setVoteStatus(0);
      dispatch(revertDownvoteOptimistic(questionId));
    } else if (wasUpvoted) {
      // Switching from upvote to downvote: 1 -> -1
      voteAdjustment = -2;
      setVoteStatus(-1);
      dispatch(revertUpvoteOptimistic(questionId));
      dispatch(downvoteQuestionOptimistic(questionId));
    } else {
      // Adding downvote: 0 -> -1
      voteAdjustment = -1;
      setVoteStatus(-1);
      dispatch(downvoteQuestionOptimistic(questionId));
    }
    
    // Update local state immediately for optimistic UI
    if (question) {
      setQuestion({
        ...question,
        votes: (question.votes || 0) + voteAdjustment
      });
    }

    try {
      await dispatch(downvoteQuestion(questionId as number)).unwrap();
      
      // Refetch to ensure data is in sync with server
      const result = await dispatch(fetchQuestionById(questionId as number)).unwrap();
      setQuestion(result.question ?? null);
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToQuestion(questionId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Downvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      if (question) {
        setQuestion({
          ...question,
          votes: (question.votes || 0) - voteAdjustment
        });
      }
      
      // Revert Redux state
      if (wasDownvoted) {
        dispatch(downvoteQuestionOptimistic(questionId));
      } else if (wasUpvoted) {
        dispatch(upvoteQuestionOptimistic(questionId));
        dispatch(revertDownvoteOptimistic(questionId));
      } else {
        dispatch(revertDownvoteOptimistic(questionId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsDownvoting(false);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async() => {
     const res = await dispatch(deleteQuestion(questionId)).unwrap();
     if(res.success == true){
      setShowDeleteDialog(false);
      window.location.href = '/';
     }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // Check if current user is the question author
  const isQuestionAuthor = question && currentUserId && (question.askedBy as any).id === currentUserId;

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
  function CommentsButton({ questionId, onOpenComments }: { questionId: number; onOpenComments?: () => void; }) {
  const comments = useSelector((s: RootState) => selectCommentsForQuestion(s, questionId));
  const count = comments?.length ?? 0;

  return (
    <button
      onClick={() => onOpenComments && onOpenComments()}
      className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors border border-gray-200"
      aria-label="Open comments"
      title={`${count} comment${count === 1 ? '' : 's'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      <span>Comments</span>

      {/* badge */}
      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-600 text-white">
        {count}
      </span>
    </button>
  );
}


  const hasUpvoted = voteStatus === 1;
  const hasDownvoted = voteStatus === -1;

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
        background: "rgba(0,0,0,0.22)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(6px)",
      }}>
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-6 h-6 text-red-600"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Question?
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-2 text-sm">
              Are you sure you want to delete this question?
            </p>
            {question && (
              <p className="text-gray-800 font-medium text-center mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                "{question.title}"
              </p>
            )}
            <p className="text-red-600 text-center mb-6 text-sm font-medium">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <article className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-6 hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight flex-1">{question.title}</h1>
          
          {/* Three dots menu - only show for question author */}
          {isQuestionAuthor && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="More options"
              >
                <ThreeDotsIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      Delete Question
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Author and Meta Information */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar user={question.askedBy as UserShort} size={44} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900">{question.askedBy.name}</span>
              <span className="text-xs text-gray-500">
                Asked {new Date((question as any).askedAt ?? question.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-medium">{(question as any).answers ?? question.answer_count}</span>
              <span className="hidden sm:inline">answers</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="font-medium">{(question as any).views ?? 0}</span>
              <span className="hidden sm:inline">views</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((t) => (
              <span 
                key={t} 
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Body */}
      <div className="mt-6 prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed">
        <ReactMarkdown>{(question as any).description ?? question.description}</ReactMarkdown>
      </div>

      {/* Footer: votes and actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
        {/* Votes */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting || isDownvoting}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${hasUpvoted 
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600 shadow-blue-100' 
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
              }
              focus:ring-blue-500
              ${(isUpvoting || isDownvoting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={hasUpvoted ? "remove upvote" : "upvote"}
          >
            <ThumbsUpIcon className={`w-5 h-5 transition-all ${hasUpvoted ? 'fill-white' : ''}`} />
            <span>{(question as any).upvotes ?? question.votes}</span>
          </button>

          <button
            onClick={handleDownvote}
            disabled={isDownvoting || isUpvoting}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${hasDownvoted 
                ? 'bg-red-500 text-white shadow-md hover:bg-red-600 shadow-red-100' 
                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
              }
              focus:ring-red-500
              ${(isUpvoting || isDownvoting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={hasDownvoted ? "remove downvote" : "downvote"}
          >
            <ThumbsDownIcon className={`w-5 h-5 transition-all ${hasDownvoted ? 'fill-white' : ''}`} />
          </button>

           <CommentsButton questionId={questionId} onOpenComments={onOpenComments} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onShare && (
            <button
              onClick={() => onShare(questionId)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors border border-gray-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(questionId)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors border border-gray-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>
    </article>
    </>
  );
}