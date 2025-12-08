import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { addAnswer } from "../../redux/slices/AnswerSlice";
import { postAnswer } from "../../services/QuestionService";

type Props = {
  questionId: number;
  onSuccess?: () => void;
};

export default function AddAnswerForm({ questionId, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      setError("Answer cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await postAnswer(questionId, body.trim());
      
      // Add answer to Redux store
      dispatch(addAnswer({
        questionId,
        answer: res.data.data,
      }));

      // Reset form
      setBody("");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post answer");
      console.error("Error posting answer:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your answer here... (Markdown supported)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={8}
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            You can use Markdown formatting
          </p>
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? "Posting..." : "Post Answer"}
          </button>
        </div>
      </form>
    </div>
  );
}