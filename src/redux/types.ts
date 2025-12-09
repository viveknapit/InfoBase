import type { UserShort } from "../services/Payload";

export interface Author {
  name: string;
  avatar: string;
  initials: string;
}

export interface User{
  id: number;
  name: string;
  email: string;
  skills: string[];
  project: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  tags: string[];
  askedBy: UserShort;
  votes: number;
  answer_count: number;
  views: number;
  related_project:string,
  createdAt:string;
}

export interface QuestionsState {
  items: Question[];
  isLoading: boolean;
  error: string | null | undefined;
  currentQuestion: Question | null; 
  drafts: QuestionDraft[]; 
  pagination?: Pagination;
  myQuestions: Question[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export interface FiltersState {
  sortBy: SortOption;
  selectedTags: string[];
}

export interface Answer {
  id:number;
  questionId:number;
  author: UserShort;
  body: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
  accepted: boolean;
}

export type ParentType = 'question' | 'answer';

export interface Comment {
  id: string | number;
  parent_type: string;  
  parent_id: string | number;
  author: Author;
  body: string;
  created_at: string;
  updated_at?: string;
  edited?: boolean;
  pending?: boolean;
}

export interface QuestionDraft {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPayload {
  title: string;
  description: string;
  tags: number[];
  visibility?: string;
  askedBy: number,
  related_project: number
}

export interface Project {
  id: number;
  name: string;
}


export type SortOption = 'Most Upvoted' | 'Most Recent' | 'Most Answered';

export type UserState = {
  user: User | null;
  isLoggedIn: Boolean;
}

export type Tag = {
  id: number;
  name: string
}