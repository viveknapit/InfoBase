// pages/ViewQuestionPage.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { RootState, AppDispatch } from "../redux/store";
import DetailedQuestionCard from "../features/Questions/DetailedQuestionCard";
import AnswerCard from "../features/Answers/AnswerCard";
import AddAnswerForm from "../features/Answers/AddAnswerForm";
import { fetchAnswers, selectAnswersForQuestion } from "../redux/slices/AnswerSlice";
import CommentModal from "../features/Comments/CommentModal";

export default function ViewQuestionPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const questionId = Number(id);

  const [showAnswerForm, setShowAnswerForm] = useState(false);

  // modalState replaces showCommentsModal boolean so we can support both question & answer comments
  type ModalState = {
    open: boolean;
    contentType: 'question' | 'answer';
    parentId: number | null;
  };

  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    contentType: 'question',
    parentId: null,
  });

  const openCommentsForQuestion = (qId: number) =>
    setModalState({ open: true, contentType: 'question', parentId: qId });

  const openCommentsForAnswer = (aId: number) =>
    setModalState({ open: true, contentType: 'answer', parentId: aId });

  const closeCommentsModal = () =>
    setModalState((s) => ({ ...s, open: false }));

  const answers = useSelector((s: RootState) => selectAnswersForQuestion(s, questionId));
  const loading = useSelector((s: RootState) => s.answers.loading);
  const error = useSelector((s: RootState) => s.answers.error);

  useEffect(() => {
    if (questionId && !isNaN(questionId)) {
      dispatch(fetchAnswers({ questionId }));
    }
  }, [dispatch, questionId]);

  const handleAnswerSuccess = () => {
    setShowAnswerForm(false);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Questions</span>
        </button>

        {/* Question Detail - pass handler to open comments modal */}
        <DetailedQuestionCard
          questionId={questionId}
          onOpenComments={() => openCommentsForQuestion(questionId)}
        />

        {/* Answers Section */}
        <div className="mt-8">
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
          ) : error ? (
            <div className="p-6 bg-red-50 rounded-lg shadow-sm text-sm text-red-600">
              Error loading answers: {error}
            </div>
          ) : answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((ans) => (
                <AnswerCard
                  key={ans.id}
                  answerId={ans.id}
                  onOpenComments={(answerId: number) => openCommentsForAnswer(answerId)}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-600 mb-3">No answers yet. Be the first to answer!</p>
            </div>
          )}
        </div>

        {/* Add Answer Section */}
        <div className="mt-8">
          {!showAnswerForm ? (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Write an Answer
            </button>
          ) : (
            <div>
              <AddAnswerForm 
                questionId={questionId} 
                onSuccess={handleAnswerSuccess}
              />
              <button
                onClick={() => setShowAnswerForm(false)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal (hosted in this page) */}
      <CommentModal
        contentType={modalState.contentType}
        parentId={modalState.parentId ?? questionId}
        open={modalState.open}
        onClose={closeCommentsModal}
      />
    </div>
  );
}
