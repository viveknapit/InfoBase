import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../redux/store';
import { createQuestion } from '../../redux/slices/QuestionsSlice';
import { Search, X, ChevronDown } from 'lucide-react';

const AskQuestionCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [visibility, setVisibility] = useState('Organization-wide');
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedTags = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'CSS', 'HTML'];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Question title is required';
    } else if (title.length < 15) {
      newErrors.title = 'Title must be at least 15 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Detailed description is required';
    } else if (description.length < 30) {
      newErrors.description = 'Description must be at least 30 characters';
    }

    if (tags.length === 0) {
      newErrors.tags = 'Please add at least one tag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && tags.length < 5 && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
      setShowTagSuggestions(false);
      if (errors.tags) {
        setErrors({ ...errors, tags: '' });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const questionData = {
        author: {
          name: 'Current User', 
          avatar: 'CU',
          initials: 'CU'
        },
        title: title.trim(),
        description: description.trim(),
        tags,
        upvotes: 0,
        answers: 0,
        askedAt: 'just now',
        lastActivity: 'just now'
      };

      await dispatch(createQuestion(questionData)).unwrap();
      navigate('/'); // Navigate back to home page
    } catch (error) {
      console.error('Failed to create question:', error);
      setErrors({ submit: 'Failed to submit question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Implement draft saving logic
    console.log('Saving draft...');
  };

  const handleCancel = () => {
    if (title || description || tags.length > 0) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600">
            Get help from the community by asking a clear, detailed question.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search for Similar Questions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search before posting to avoid duplicates
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for similar questions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Question Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Question Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Be specific and clear about your question"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="text-sm text-gray-500 mt-1">
              Make your title descriptive and concise
            </p>
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Provide all the relevant details..."
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-2 text-sm text-gray-500 space-y-1">
              <p>- What are you trying to achieve?</p>
              <p>- What have you tried?</p>
              <p>- What error messages are you seeing?</p>
              <p className="mt-3 font-medium">
                Include code samples, error messages, and context
              </p>
            </div>
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tags
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 flex-wrap p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  placeholder={tags.length === 0 ? "Add up to 5 tags..." : ""}
                  disabled={tags.length >= 5}
                  className="flex-1 min-w-[200px] px-2 py-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
                >
                  Add
                </button>
              </div>

              {/* Tag Suggestions */}
              {showTagSuggestions && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 mb-2 px-2">
                      Suggested:
                    </p>
                    {suggestedTags
                      .filter(tag => 
                        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
                        !tags.includes(tag)
                      )
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Add up to 5 tags to describe what your question is about
            </p>
            {errors.tags && (
              <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Visibility
            </label>
            <div className="relative w-64">
              <button
                type="button"
                onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <span className="text-gray-700">{visibility}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showVisibilityDropdown && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {['Organization-wide', 'Team only', 'Private'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setVisibility(option);
                        setShowVisibilityDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        visibility === option ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionCard;