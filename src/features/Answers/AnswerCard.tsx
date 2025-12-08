import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { Answer } from "../../redux/types";
import { selectAnswerById, updateVote } from "../../redux/slices/AnswerSlice";

type Props = {
  answerId: string | number;
  showAcceptedBadge?: boolean;
};

export default function AnswerCard({ answerId, showAcceptedBadge = true }: Props) {
  const dispatch = useDispatch();
  const answer = useSelector((s: RootState) => selectAnswerById(s, answerId)) as Answer | undefined;

  if (!answer) {
    return (
      <div className="p-4 bg-white rounded shadow-sm text-sm text-gray-500">
        Answer not found.
      </div>
    );
  }

  const handleVote = async (delta: number) => {
    const originalVotes = answer.votes;
    const newVotes = originalVotes + delta;

    // Optimistic update
    dispatch(updateVote({ answerId, votes: newVotes }));

  //   try {
  //     // Call your service
  //     const res = await voteAnswer(answerId, delta);
      
  //     // Update with actual server response
  //     if (res.data?.votes !== undefined) {
  //       dispatch(updateVote({ answerId, votes: res.data.votes }));
  //     }
  //   } catch (error) {
  //     // Rollback on error
  //     dispatch(updateVote({ answerId, votes: originalVotes }));
  //     console.error("Vote failed:", error);
  //   }
  };

  return (
    <article className="bg-white rounded p-4 mb-4 shadow-sm">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
              {answer.author.name?.split(" ").map(n => n[0]).slice(0, 2).join("") ?? "U"}
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-800">{answer.author.name}</div>
              <div className="text-xs text-gray-500">
                {answer.createdAt ? new Date(answer.createdAt).toLocaleString() : ""}
              </div>
            </div>
          </div>

          {showAcceptedBadge && answer.accepted && (
            <div className="text-green-600 text-sm font-medium">✔ Accepted</div>
          )}
        </div>

        {/* Body */}
        <div className="prose max-w-none text-sm mb-4">
          <ReactMarkdown>{answer.body}</ReactMarkdown>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              aria-label="upvote" 
              onClick={() => handleVote(1)} 
              className="px-3 py-1 rounded hover:bg-gray-100 text-sm"
            >
              ▲
            </button>

            <div className="text-sm font-semibold w-10 text-center">{answer.votes}</div>

            <button 
              aria-label="downvote" 
              onClick={() => handleVote(-1)} 
              className="px-3 py-1 rounded hover:bg-gray-100 text-sm"
            >
              ▼
            </button>
          </div>

          <div className="text-sm text-gray-500">{/* actions placeholder */}</div>
        </div>
      </div>
    </article>
  );
}