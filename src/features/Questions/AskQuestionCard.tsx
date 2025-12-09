import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../redux/store';
import { createQuestion } from '../../redux/slices/QuestionsSlice';
import { getAllTags, type Tag } from '../../redux/slices/TagsSlice';
import { setProjects, setLoading as setProjectsLoading, setError as setProjectsError} from '../../redux/slices/ProjectSlice'
import { getAllProjects } from '../../services/ProjectService';
import type { Project } from '../../redux/types';
import {X, ChevronDown, CheckCircle } from 'lucide-react';

const AskQuestionCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  // Project related state
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  const [visibility, setVisibility] = useState('TEAM');
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdQuestionId, setCreatedQuestionId] = useState<number | null>(null);

  // Refs for dropdown handling
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const visibilityDropdownRef = useRef<HTMLDivElement>(null);

  const currentUserId = useSelector((state: RootState) => state.users.user!.id);

  // Fetch all tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const result = await dispatch(getAllTags()).unwrap();
        console.log('Fetched tags:', result); // Debug log
        setAvailableTags(result);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        setErrors(prev => ({ ...prev, tags: 'Failed to load tags' }));
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, [dispatch]);

  // Fetch all projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      dispatch(setProjectsLoading(true));
      try {
        const projects = await getAllProjects();
        dispatch(setProjects(projects));
        setAvailableProjects(projects);
        
        // Auto-select first project if available
        if (projects.length > 0) {
          setSelectedProject(projects[0]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        dispatch(setProjectsError('Failed to load projects'));
        setErrors(prev => ({ ...prev, project: 'Failed to load projects' }));
      } finally {
        setIsLoadingProjects(false);
        dispatch(setProjectsLoading(false));
      }
    };

    fetchProjects();
  }, [dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
      if (visibilityDropdownRef.current && !visibilityDropdownRef.current.contains(event.target as Node)) {
        setShowVisibilityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    if (selectedTags.length === 0) {
      newErrors.tags = 'Please add at least one tag';
    }

    if (!selectedProject) {
      newErrors.project = 'Please select a related project';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (tag: Tag) => {
    console.log('Adding tag:', tag); // Debug log
    console.log('Current selected tags:', selectedTags); // Debug log
    
    if (selectedTags.length >= 5) {
      console.warn('Maximum tags reached');
      return;
    }
    
    const tagExists = selectedTags.some(t => t.id === tag.id);
    if (tagExists) {
      console.warn('Tag already selected');
      return;
    }

    const updatedTags = [...selectedTags, tag];
    setSelectedTags(updatedTags);
    console.log('Updated tags:', updatedTags); // Debug log
    
    setTagInput('');
    setShowTagSuggestions(false);
    
    if (errors.tags) {
      setErrors({ ...errors, tags: '' });
    }
  };

  const handleRemoveTag = (tagId: number) => {
    console.log('Removing tag:', tagId); // Debug log
    const updatedTags = selectedTags.filter(tag => tag.id !== tagId);
    setSelectedTags(updatedTags);
    console.log('Tags after removal:', updatedTags); // Debug log
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (!tagInput.trim()) {
        return;
      }
      
      const matchingTag = availableTags.find(
        tag => tag.name.toLowerCase() === tagInput.trim().toLowerCase()
      );
      
      if (matchingTag) {
        handleAddTag(matchingTag);
      } else {
        console.warn('No matching tag found for:', tagInput);
      }
    }
  };

  const getFilteredTags = () => {
    if (!tagInput.trim()) return availableTags;
    
    const filtered = availableTags.filter(tag => 
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) && 
      !selectedTags.some(t => t.id === tag.id)
    );
    
    console.log('Filtered tags:', filtered); // Debug log
    return filtered;
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDropdown(false);
    if (errors.project) {
      setErrors({ ...errors, project: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting with tags:', selectedTags); // Debug log
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const questionData = {
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags.map(tag => tag.id),
        visibility: visibility,
        askedBy: currentUserId,
        related_project: selectedProject!.id
      };

      console.log('Question data being submitted:', questionData); // Debug log

      const result = await dispatch(createQuestion(questionData)).unwrap();
      
      // Store the created question ID and show success dialog
      setCreatedQuestionId(result.id);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Failed to create question:', error);
      setErrors({ submit: 'Failed to submit question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewQuestion = () => {
    if (createdQuestionId) {
      navigate(`/question/${createdQuestionId}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...');
  };

  const handleCancel = () => {
    if (title || description || selectedTags.length > 0) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <>
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
            {/* Question Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Question Title<span className="text-red-500">*</span>
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
                Detailed Description<span className="text-red-500">*</span>
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
            <div ref={tagDropdownRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tags<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className={`flex items-center gap-2 flex-wrap p-2 border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent ${
                  errors.tags ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveTag(tag.id);
                        }}
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
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    placeholder={selectedTags.length === 0 ? "Search and select tags..." : ""}
                    disabled={selectedTags.length >= 5 || isLoadingTags}
                    className="flex-1 min-w-[200px] px-2 py-1 outline-none disabled:bg-gray-50"
                  />
                </div>

                {showTagSuggestions && !isLoadingTags && availableTags.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="p-2">
                      {getFilteredTags().length > 0 ? (
                        <>
                          <p className="text-xs font-semibold text-gray-500 mb-2 px-2">
                            {tagInput ? 'Matching tags:' : 'Available tags:'}
                          </p>
                          {getFilteredTags().map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleAddTag(tag);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                            >
                              {tag.name}
                            </button>
                          ))}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 px-3 py-2">No matching tags found</p>
                      )}
                    </div>
                  </div>
                )}

                {isLoadingTags && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <p className="text-sm text-gray-500 text-center">Loading tags...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Add up to 5 tags to describe what your question is about ({selectedTags.length}/5 selected)
              </p>
              {errors.tags && (
                <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
              )}
            </div>

            {/* Related Project */}
            <div ref={projectDropdownRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Related Project<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  disabled={isLoadingProjects}
                  className={`w-full flex items-center justify-between px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.project ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <span className={selectedProject ? 'text-gray-900' : 'text-gray-500'}>
                    {isLoadingProjects ? 'Loading projects...' : (selectedProject ? selectedProject.name : 'Select a project')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showProjectDropdown && !isLoadingProjects && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {availableProjects.length > 0 ? (
                      availableProjects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => handleProjectSelect(project)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                            selectedProject?.id === project.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                          }`}
                        >
                          {project.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No projects available</div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select which project this question is related to
              </p>
              {errors.project && (
                <p className="text-sm text-red-600 mt-1">{errors.project}</p>
              )}
            </div>

            {/* Visibility */}
            <div ref={visibilityDropdownRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Visibility<span className="text-red-500">*</span>
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
                    {['PUBLIC', 'TEAM', 'CONFIDENTIAL'].map((option) => (
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

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
        background: "rgba(0,0,0,0.22)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Question Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your question has been posted and the community can now help you with answers.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleViewQuestion}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  View Question
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AskQuestionCard;