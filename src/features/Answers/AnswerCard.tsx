import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import type { Answer } from "../../redux/types";
import {
  upvoteAnswer,
  downvoteAnswer,
  upvoteAnswerOptimistic,
  downvoteAnswerOptimistic,
  revertUpvoteOptimistic,
  revertDownvoteOptimistic,
  selectAnswerById,
} from "../../redux/slices/AnswerSlice";
import type { UserShort } from "../../services/Payload";
import { isUserVotedToAnswer } from "../../services/QuestionService";
import { selectCommentsForAnswer } from "../../redux/slices/CommentSlice";

type Props = {
  answerId: number;
  showAcceptedBadge?: boolean;
  canAccept?: boolean;
  onAccept?: (id: number) => void;
  onOpenComments?: (answerId: number) => void; // <-- added optional prop
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
      {(user as any)?.avatar || (user as any)?.avatarUrl ? (
        <img src={(user as any).avatar || (user as any).avatarUrl} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

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

// Comment Icon (speech bubble) to match DetailedQuestionCard style
const CommentIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function AnswerCard({ answerId, showAcceptedBadge = true, canAccept = false, onAccept, onOpenComments }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const answer = useSelector((state: RootState) => selectAnswerById(state, answerId)) as Answer | undefined;

  const [isUpvoting, setIsUpvoting] = useState<boolean>(false);
  const [isDownvoting, setIsDownvoting] = useState<boolean>(false);
  const [voteStatus, setVoteStatus] = useState<number>(0); // 1: upvoted, -1: downvoted, 0: no vote
  const [localVotes, setLocalVotes] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    // Fetch user's vote status
    const fetchVoteStatus = async () => {
      try {
        const userVoteStatus = await isUserVotedToAnswer(answerId);
        if (!mounted) return;
        setVoteStatus(userVoteStatus);
      } catch (err: any) {
        console.error("Error fetching vote status:", err);
      }
    };

    fetchVoteStatus();

    return () => {
      mounted = false;
    };
  }, [answerId]);

  useEffect(() => {
    if (answer) {
      setLocalVotes(answer.votes || 0);
    }
  }, [answer]);

  const handleUpvote = async () => {
    if (isUpvoting || isDownvoting || !answer) return;
    
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
      dispatch(revertUpvoteOptimistic(answerId));
    } else if (wasDownvoted) {
      // Switching from downvote to upvote: -1 -> 1
      voteAdjustment = 2;
      setVoteStatus(1);
      dispatch(revertDownvoteOptimistic(answerId));
      dispatch(upvoteAnswerOptimistic(answerId));
    } else {
      // Adding upvote: 0 -> 1
      voteAdjustment = 1;
      setVoteStatus(1);
      dispatch(upvoteAnswerOptimistic(answerId));
    }
    
    // Update local state immediately for optimistic UI
    setLocalVotes(localVotes + voteAdjustment);

    try {
      await dispatch(upvoteAnswer(answerId as number)).unwrap();
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToAnswer(answerId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Upvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      setLocalVotes(localVotes);
      
      // Revert Redux state
      if (wasUpvoted) {
        dispatch(upvoteAnswerOptimistic(answerId));
      } else if (wasDownvoted) {
        dispatch(downvoteAnswerOptimistic(answerId));
        dispatch(revertUpvoteOptimistic(answerId));
      } else {
        dispatch(revertUpvoteOptimistic(answerId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isDownvoting || isUpvoting || !answer) return;
    
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
      dispatch(revertDownvoteOptimistic(answerId));
    } else if (wasUpvoted) {
      // Switching from upvote to downvote: 1 -> -1
      voteAdjustment = -2;
      setVoteStatus(-1);
      dispatch(revertUpvoteOptimistic(answerId));
      dispatch(downvoteAnswerOptimistic(answerId));
    } else {
      // Adding downvote: 0 -> -1
      voteAdjustment = -1;
      setVoteStatus(-1);
      dispatch(downvoteAnswerOptimistic(answerId));
    }
    
    // Update local state immediately for optimistic UI
    setLocalVotes(localVotes + voteAdjustment);

    try {
      await dispatch(downvoteAnswer(answerId as number)).unwrap();
      
      // Verify vote status from server
      const newVoteStatus = await isUserVotedToAnswer(answerId);
      setVoteStatus(newVoteStatus);
      
    } catch (err: any) {
      console.error("Downvote failed:", err);
      
      // Revert optimistic update on error
      setVoteStatus(previousVoteStatus);
      setLocalVotes(localVotes);
      
      // Revert Redux state
      if (wasDownvoted) {
        dispatch(downvoteAnswerOptimistic(answerId));
      } else if (wasUpvoted) {
        dispatch(upvoteAnswerOptimistic(answerId));
        dispatch(revertDownvoteOptimistic(answerId));
      } else {
        dispatch(revertDownvoteOptimistic(answerId));
      }
      
      alert(err.message || "Failed to process vote. Please try again.");
    } finally {
      setIsDownvoting(false);
    }
  };

  if (!answer) {
    return (
      <div className="p-4 bg-white rounded shadow-sm text-sm text-gray-500">
        Answer not found.
      </div>
    );
  }

  const hasUpvoted = voteStatus === 1;
  const hasDownvoted = voteStatus === -1;

  // comments count from slice
  const comments = useSelector((s: RootState) => selectCommentsForAnswer(s, answerId));
  const commentsCount = comments?.length ?? 0;

  return (
    <article className="bg-white rounded shadow-sm p-4 mb-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar user={answer.author as UserShort} size={32} />
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-sm text-gray-800">{answer.author.name}</span>
            <span className="text-xs text-gray-500">
              {new Date((answer as any).answeredAt ?? answer.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {showAcceptedBadge && answer.accepted && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Accepted</span>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="prose max-w-none text-sm mb-4">
        <ReactMarkdown>{(answer as any).body ?? answer.body}</ReactMarkdown>
      </div>

      {/* Footer: votes at left, actions at right */}
      <div className="pt-3 border-t flex items-center justify-between">
        {/* Votes */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting || isDownvoting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${hasUpvoted 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-50' 
                : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }
              focus:ring-blue-500
              ${(isUpvoting || isDownvoting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={hasUpvoted ? "remove upvote" : "upvote"}
          >
            <ThumbsUpIcon className={`w-5 h-5 transition-all ${hasUpvoted ? 'fill-blue-700' : ''}`} />
            <span className="font-semibold">{localVotes}</span>
          </button>

          <button
            onClick={handleDownvote}
            disabled={isDownvoting || isUpvoting}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${hasDownvoted 
                ? 'bg-red-100 text-red-700 hover:bg-red-50' 
                : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600'
              }
              focus:ring-red-500
              ${(isUpvoting || isDownvoting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={hasDownvoted ? "remove downvote" : "downvote"}
          >
            <ThumbsDownIcon className={`w-5 h-5 transition-all ${hasDownvoted ? 'fill-red-700' : ''}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canAccept && onAccept && !answer.accepted && (
            <button
              onClick={() => onAccept(answerId)}
              className="px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors"
            >
              Accept Answer
            </button>
          )}

          {/* Comments button (opens modal in parent via onOpenComments) */}
          <button
            onClick={() => onOpenComments && onOpenComments(answerId)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors border border-gray-200"
            aria-label="Open comments"
            title={`${commentsCount} comment${commentsCount === 1 ? '' : 's'}`}
          >
            <CommentIcon className="w-4 h-4" />
            <span>Comments</span>
            <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${commentsCount ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
              {commentsCount}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
