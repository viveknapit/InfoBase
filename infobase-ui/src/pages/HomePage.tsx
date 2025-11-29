import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchQuestions, upvoteQuestion } from '../redux/slices/QuestionsSlice';
import { setSortBy, toggleTag, clearFilters } from '../redux/slices/FilterSlice';
import type { SortOption } from '../redux/types';
import QuestionCard from '../features/Questions/QuestionCard';
import { ChevronDown, Filter, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: questions, isLoading, error } = useSelector((state: RootState) => state.questions);
  const { sortBy, selectedTags } = useSelector((state: RootState) => state.filters);
  const navigate = useNavigate();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach(q => q.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [questions]);

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = [...questions];

    if (selectedTags.length > 0) {
      filtered = filtered.filter(q =>
        q.tags.some(tag => selectedTags.includes(tag))
      );
    }

    switch (sortBy) {
      case 'Most Upvoted':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'Most Recent':
        filtered.sort((a, b) => {
          const daysA = parseInt(a.askedAt) || 0;
          const daysB = parseInt(b.askedAt) || 0;
          return daysA - daysB;
        });
        break;
      case 'Most Answered':
        filtered.sort((a, b) => b.answers - a.answers);
        break;
    }

    return filtered;
  }, [questions, sortBy, selectedTags]);

  const handleUpvote = (questionId: number) => {
    dispatch(upvoteQuestion(questionId));
  };

  const handleSortChange = (option: SortOption) => {
    dispatch(setSortBy(option));
    setShowSortDropdown(false);
  };

  const handleTagToggle = (tag: string) => {
    dispatch(toggleTag(tag));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowFilterModal(false);
  };

  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
            <p className="text-gray-600 mt-1">{filteredAndSortedQuestions.length} questions</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={()=> navigate('/ask')}
          >
            <Plus className="w-5 h-5" />
            Ask a Question
          </button>
        </div>

        {/* Filters and Sort */}
        <div className="flex gap-3 mb-6">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700">{sortBy}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {showSortDropdown && (
              <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {(['Most Upvoted', 'Most Recent', 'Most Answered'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === option ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter by Tags Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Filter by Tags</span>
            {selectedTags.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Selected Tags Pills */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredAndSortedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onUpvote={handleUpvote}
            />
          ))}
        </div>

        {filteredAndSortedQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No questions found matching your filters.
          </div>
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filter by Tags</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-2 mb-6">
                {allTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;