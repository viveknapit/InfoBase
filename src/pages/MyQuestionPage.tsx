import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import QuestionCard from '../features/Questions/QuestionCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMyQuestions } from '../redux/slices/QuestionsSlice';

const MyQuestionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const myQuestions = useSelector((state: RootState) => state.questions.myQuestions || []);
  const isLoading = useSelector((state: RootState) => state.questions.isLoading);
  const error = useSelector((state: RootState) => state.questions.error);

  useEffect(() => {
  dispatch(fetchMyQuestions());

}, [dispatch]);

  const handleUpvote = (questionId: number) => {
    // Implement upvote logic if needed
    console.log('Upvote question:', questionId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your questions...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!myQuestions || myQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Questions</h1>
            <button 
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => navigate('/ask')}
            >
              <Plus className="w-5 h-5" />
              Ask a Question
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-lg text-gray-600 mb-4">You haven't asked any questions yet</div>
            <p className="text-gray-500 mb-6">Start contributing to the community!</p>
            <button
              onClick={() => navigate('/ask')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ask Your First Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Questions</h1>
            <p className="text-gray-600 mt-1">
              {myQuestions.length} question{myQuestions.length !== 1 ? 's' : ''} posted
            </p>
          </div>
          <button 
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => navigate('/ask')}
          >
            <Plus className="w-5 h-5" />
            Ask a Question
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {myQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyQuestionsPage;