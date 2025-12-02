import { mockQuestions, mockUsers, mockTags, mockAnswers } from '../data/index';
import type { Question, QuestionDraft, CreateQuestionPayload } from '../redux/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const shouldFail = () => Math.random() < 0.1;

let questionsData = [...mockQuestions];
let draftsData: QuestionDraft[] = [];
let nextQuestionId = Math.max(...mockQuestions.map(q => q.id)) + 1;
let nextDraftId = 1;

export const mockApi = {
  questions: {
    // Get all questions
    getAll: async (): Promise<Question[]> => {
      await delay(500);
      if (shouldFail()) {
        throw new Error('Failed to fetch questions');
      }
      return mockQuestions;
    },
    
    // Get single question by ID
    getById: async (id: number): Promise<Question | undefined> => {
      await delay(300);
      
      if (shouldFail()) {
        throw new Error(`Failed to fetch question ${id}`);
      }
      
      return mockQuestions.find(q => q.id === id);
    },
    
    // Upvote a question
    upvote: async (id: number): Promise<{ id: number; newUpvotes: number }> => {
      await delay(300);
      
      if (shouldFail()) {
        throw new Error('Failed to upvote question');
      }
      
      const question = mockQuestions.find(q => q.id === id);
      if (!question) {
        throw new Error('Question not found');
      }
      
      // Simulate backend updating the upvote count
      const newUpvotes = question.upvotes + 1;
      return { id, newUpvotes };
    },
    
    // Create a new question
    create: async (questionData: CreateQuestionPayload): Promise<Question> => {
      await delay(800);
      
      const newQuestion: Question = {
        id: nextQuestionId++,
        author: {
          name: 'Current User',
          avatar: 'CU',
          initials: 'CU',
          id: 0,
          skills: [],
          project: ''
        },
        title: questionData.title,
        description: questionData.description,
        tags: questionData.tags,
        upvotes: 0,
        answers: 0,
        askedAt: 'just now',
        lastActivity: 'just now'
      };

      questionsData.unshift(newQuestion);
      return newQuestion;
    },

    // Update question
    update: async (id: number, updates: Partial<Question>): Promise<Question> => {
      await delay(500);
      
      const index = questionsData.findIndex(q => q.id === id);
      if (index === -1) {
        throw new Error('Question not found');
      }

      questionsData[index] = {
        ...questionsData[index],
        ...updates,
        lastActivity: 'just now'
      };

      return questionsData[index];
    },
    
    // Delete a question
     delete: async (id: number): Promise<void> => {
      await delay(500);
      questionsData = questionsData.filter(q => q.id !== id);
    },
    
    // Validate question (check for duplicates)
    validate: async (title: string): Promise<{ isDuplicate: boolean; suggestions: Question[] }> => {
      await delay(300);
      
      const lowerTitle = title.toLowerCase();
      const suggestions = questionsData.filter(q =>
        q.title.toLowerCase().includes(lowerTitle)
      ).slice(0, 5);

      return {
        isDuplicate: suggestions.length > 0,
        suggestions
      };
    },

     search: async (query: string): Promise<Question[]> => {
      await delay(400);
      
      const lowerQuery = query.toLowerCase();
      return questionsData.filter(q =>
        q.title.toLowerCase().includes(lowerQuery) ||
        q.description.toLowerCase().includes(lowerQuery) ||
        q.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    },
  },
  
  drafts: {
     getAll: async (): Promise<QuestionDraft[]> => {
      await delay(300);
      return [...draftsData];
    },

    // Get draft by ID
    getById: async (id: string): Promise<QuestionDraft | undefined> => {
      await delay(200);
      return draftsData.find(d => d.id === id);
    },

    // Save draft
    save: async (draft: Omit<QuestionDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuestionDraft> => {
      await delay(400);
      
      const newDraft: QuestionDraft = {
        id: `draft_${nextDraftId++}`,
        ...draft,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      draftsData.push(newDraft);
      return newDraft;
    },

    update: async (id: string, updates: Partial<QuestionDraft>): Promise<QuestionDraft> => {
      await delay(400);
      
      const index = draftsData.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error('Draft not found');
      }

      draftsData[index] = {
        ...draftsData[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return draftsData[index];
    },

    // Delete draft
    delete: async (id: string): Promise<void> => {
      await delay(300);
      draftsData = draftsData.filter(d => d.id !== id);
    }
  },
  
  users: {
    getAll: async () => {
      await delay(400);
      
      if (shouldFail()) {
        throw new Error('Failed to fetch users');
      }
      
      return mockUsers;
    },
    
    getById: async (id: number) => {
      await delay(300);
      return mockUsers.find(u => u.id === id);
    },
  },
  
  tags: {
    // Get all available tags
    getAll: async (): Promise<string[]> => {
      await delay(200);
      const tagSet = new Set<string>();
      questionsData.forEach(q => q.tags.forEach(tag => tagSet.add(tag)));
      return Array.from(tagSet).sort();
    },

    // Get popular tags
    getPopular: async (limit: number = 10): Promise<Array<{ name: string; count: number }>> => {
      await delay(200);
      
      const tagCounts: { [key: string]: number } = {};
      questionsData.forEach(q => {
        q.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },

    // Search tags
    search: async (query: string): Promise<string[]> => {
      await delay(200);
      const allTags = await mockApi.tags.getAll();
      const lowerQuery = query.toLowerCase();
      return allTags.filter(tag => tag.toLowerCase().includes(lowerQuery));
    }
  },
  
  answers: {
    getByQuestionId: async (questionId: number) => {
      await delay(400);
      
      if (shouldFail()) {
        throw new Error('Failed to fetch answers');
      }
      
      return mockAnswers.filter(a => a.questionId === questionId);
    },
  },
};