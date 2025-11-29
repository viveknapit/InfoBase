import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Question, QuestionsState, QuestionDraft, CreateQuestionPayload } from '../types';
import { mockApi } from '../../services/mockApi';

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async () => {
    const questions = await mockApi.questions.getAll();
    return questions;
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (id: number) => {
    const question = await mockApi.questions.getById(id);
    if (!question) throw new Error('Question not found');
    return { questionId: id, question };
  }
);

export const upvoteQuestion = createAsyncThunk(
  'questions/upvoteQuestion',
  async (questionId: number) => {
    return await mockApi.questions.upvote(questionId);
  }
);

// NEW: Create question thunk
export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData: CreateQuestionPayload) => {
    return await mockApi.questions.create(questionData);
  }
);

// NEW: Update question thunk
export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ id, updates }: { id: number; updates: Partial<Question> }) => {
    return await mockApi.questions.update(id, updates);
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (id: number) => {
    await mockApi.questions.delete(id);
    return id;
  }
);

// NEW: Search questions thunk
export const searchQuestions = createAsyncThunk(
  'questions/searchQuestions',
  async (query: string) => {
    return await mockApi.questions.search(query);
  }
);

// NEW: Validate question thunk
export const validateQuestion = createAsyncThunk(
  'questions/validateQuestion',
  async (title: string) => {
    return await mockApi.questions.validate(title);
  }
);

// NEW: Draft management thunks
export const fetchDrafts = createAsyncThunk(
  'questions/fetchDrafts',
  async () => {
    return await mockApi.drafts.getAll();
  }
);

export const saveDraft = createAsyncThunk(
  'questions/saveDraft',
  async (draft: Omit<QuestionDraft, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await mockApi.drafts.save(draft);
  }
);

export const updateDraft = createAsyncThunk(
  'questions/updateDraft',
  async ({ id, updates }: { id: string; updates: Partial<QuestionDraft> }) => {
    return await mockApi.drafts.update(id, updates);
  }
);

export const deleteDraft = createAsyncThunk(
  'questions/deleteDraft',
  async (id: string) => {
    await mockApi.drafts.delete(id);
    return id;
  }
);

const initialState: QuestionsState = {
  items: [],
  isLoading: false,
  error: null,
  currentQuestion: null,
  drafts: []
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    upvoteQuestionOptimistic: (state, action: PayloadAction<number>) => {
      const question = state.items.find(q => q.id === action.payload);
      if (question) {
        question.upvotes += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
    },
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all questions
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      
      // Fetch single question
      .addCase(fetchQuestionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.isLoading = false;
        const question = action.payload.question;
        state.currentQuestion = question;
        const index = state.items.findIndex(q => q.id === question.id);
        if (index !== -1) {
          state.items[index] = question;
        } else {
          state.items.push(question);
        }
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch question';
      })
      
      // Upvote question
      .addCase(upvoteQuestion.fulfilled, (state, action) => {
        const question = state.items.find(q => q.id === action.payload.id);
        if (question) {
          question.upvotes = action.payload.newUpvotes;
        }
        if (state.currentQuestion?.id === action.payload.id) {
          state.currentQuestion.upvotes = action.payload.newUpvotes;
        }
      })
      .addCase(upvoteQuestion.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to upvote question';
      })
      
      // Create question
      .addCase(createQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create question';
      })
      
      // Update question
      .addCase(updateQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentQuestion?.id === action.payload.id) {
          state.currentQuestion = action.payload;
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update question';
      })
      
      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(q => q.id !== action.payload);
        if (state.currentQuestion?.id === action.payload) {
          state.currentQuestion = null;
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete question';
      })
      
      // Search questions
      .addCase(searchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(searchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search questions';
      })
      
      // Fetch drafts
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.drafts = action.payload;
      })
      
      // Save draft
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.drafts.push(action.payload);
      })
      
      // Update draft
      .addCase(updateDraft.fulfilled, (state, action) => {
        const index = state.drafts.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drafts[index] = action.payload;
        }
      })
      
      // Delete draft
      .addCase(deleteDraft.fulfilled, (state, action) => {
        state.drafts = state.drafts.filter(d => d.id !== action.payload);
      });
  },
});

export const { 
  upvoteQuestionOptimistic, 
  clearError, 
  setCurrentQuestion, 
  clearCurrentQuestion 
} = questionsSlice.actions;

export default questionsSlice.reducer;