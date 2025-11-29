import React from 'react';
import { ArrowUp, MessageCircle, Clock } from 'lucide-react';
import type { Question } from '../../redux/types';
import { useNavigate } from 'react-router-dom';

interface QuestionCardProps {
  question: Question;
  onUpvote: (questionId: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpvote }) => {

  const navigate = useNavigate();

  const handleQuestionClick = () => {
    navigate(`/question/${question.id}`);
  }

  const handleUpvoteClick = (e : React.MouseEvent) => {
      e.stopPropagation();
      onUpvote(question.id);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={handleQuestionClick}>
      {/* Author Info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
          {question.author.initials}
        </div>
        <span className="text-gray-700 font-medium">{question.author.name}</span>
        <span className="text-gray-500 text-sm">asked {question.askedAt}</span>
      </div>

      {/* Question Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer">
        {question.title}
      </h3>

      {/* Question Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">
        {question.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <button
          // onClick={() => onUpvote(question.id)}
          onClick={handleUpvoteClick}
          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="font-medium">{question.upvotes}</span>
        </button>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{question.answers} answers</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-4 h-4" />
          <span>{question.lastActivity}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;