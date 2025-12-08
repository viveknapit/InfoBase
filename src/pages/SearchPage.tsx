import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../redux/store';
import {
  searchQuestions,
  setQuery,
  setPage,
  setSortBy,
} from '../redux/slices/SearchSlice';
import SearchBar from '../components/SearchBar';
import { ChevronLeft, ChevronRight, MessageCircle, ArrowUp, Eye } from 'lucide-react';

const SearchPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    query,
    results,
    total,
    page,
    limit,
    totalPages,
    sortBy,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.search);

  // Initialize search from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlSort = searchParams.get('sort') || 'relevant';

    if (urlQuery && urlQuery !== query) {
      dispatch(setQuery(urlQuery));
    }

    if (urlPage !== page) {
      dispatch(setPage(urlPage));
    }

    if (urlSort !== sortBy) {
      dispatch(setSortBy(urlSort as any));
    }

    // Trigger search
    dispatch(
      searchQuestions({
        query: urlQuery || '',
        page: urlPage,
        limit,
        sortBy: urlSort,
      })
    );
  }, [searchParams]); // Only re-run when URL changes

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    dispatch(setSortBy(newSortBy as any));
    dispatch(setPage(1));
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', '1');
    params.set('sort', newSortBy);
    navigate(`/search?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    dispatch(setPage(newPage));
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', newPage.toString());
    params.set('sort', sortBy);
    navigate(`/search?${params.toString()}`);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle question click
  const handleQuestionClick = (questionId: number) => {
    navigate(`/question/${questionId}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {query ? `Search Results for "${query}"` : 'All Questions'}
              </h1>
              <p className="text-gray-600 mt-1">
                {total.toLocaleString()} {total === 1 ? 'question' : 'questions'} found
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="relevant">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="votes">Most Votes</option>
                <option value="answers">Most Answers</option>
                <option value="views">Most Views</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && results.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">No questions found</p>
            <p className="text-gray-500 text-sm">
              {query
                ? `Try adjusting your search terms or filters`
                : 'Be the first to ask a question!'}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((question) => (
              <div
                key={question.id}
                onClick={() => handleQuestionClick(question.id)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Question Title */}
                <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 mb-2">
                  {question.title}
                </h2>

                {/* Description Snippet */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {question.descriptionSnippet}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-4 h-4" />
                      <span>{question.votes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{question.answersCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{question.views}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      asked {formatDate(question.createdAt)} by
                    </span>
                    <span className="font-medium text-gray-700">
                      {question.askedBy.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && results.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;