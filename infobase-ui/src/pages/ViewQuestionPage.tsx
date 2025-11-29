import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { RootState, AppDispatch } from "../redux/store";
import DetailedQuestionCard from "../features/Questions/DetailedQuestionCard";
import AnswerCard from "../features/Answers/AnswerCard";
import { fetchAnswers, selectAnswersForQuestion } from "../redux/slices/AnswerSlice";

export default function ViewQuestionPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const questionId = Number(id);

  useEffect(() => {
    if (questionId) {
      dispatch(fetchAnswers({ questionId }));
    }
  }, [dispatch, questionId]);

  const answers = useSelector((s: RootState) => selectAnswersForQuestion(s, questionId)) ?? [];
  const loading = useSelector((s: RootState) => s.answers.loading);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Questions</span>
        </button>

        {/* Question Detail */}
        <DetailedQuestionCard questionId={questionId} />

        {/* Answers Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            <div className="text-sm text-gray-500">Sorted by: votes</div>
          </div>

          {loading ? (
            <div className="p-6 bg-white rounded-lg shadow-sm text-sm text-gray-600">
              Loading answers...
            </div>
          ) : answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((ans: any) => (
                <AnswerCard key={ans.id} answerId={ans.id} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-3">No answers yet. Be the first to answer!</p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                Write an Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}