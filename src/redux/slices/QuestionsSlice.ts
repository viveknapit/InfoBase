import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Question, QuestionsState, CreateQuestionPayload } from '../types';
import { createQuestionApi, getAllQuestions, getQuestionById, voteQuestion, getMyQuestions, deleteQuestionApi} from '../../services/QuestionService';
import type { VotePayload } from '../../services/Payload';

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) => {
    const response = await getAllQuestions(page, limit);
    return response;
  }
);

export const fetchMyQuestions = createAsyncThunk(
  'questions/fetchMyQuestions',
  async () => {
    const response = await getMyQuestions();
    return response;
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (id: number) => {
    const question = await getQuestionById(id);
    if (!question) throw new Error('Question not found');
    return { questionId: id, question };
  }
);

export const upvoteQuestion = createAsyncThunk(
  'questions/upvoteQuestion',
  async (questionId: number) => {
    const votePayload: VotePayload = { votingId: questionId, action: "upvote" };
    return voteQuestion(votePayload);
  }
);

export const downvoteQuestion = createAsyncThunk(
  'questions/downvoteQuestion',
  async (questionId: number) => {
    const votePayload: VotePayload = { votingId: questionId, action: "downvote" };
    return voteQuestion(votePayload);
  }
);

export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (questionData: CreateQuestionPayload) => {
    return await createQuestionApi(questionData);
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (id: number) => {
    return await deleteQuestionApi(id);
  }
);

const initialState: QuestionsState = {
  items: [],
  isLoading: false,
  error: null,
  currentQuestion: null,
  drafts: [],
  myQuestions: [],
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    upvoteQuestionOptimistic: (state, action: PayloadAction<number>) => {
      const question = state.items.find(q => q.id === action.payload);
      if (question) {
        question.votes = (question.votes || 0) + 1;
      }
      if (state.currentQuestion && state.currentQuestion.id === action.payload) {
        state.currentQuestion.votes = (state.currentQuestion.votes || 0) + 1;
      }
    },
    downvoteQuestionOptimistic: (state, action: PayloadAction<number>) => {
      const question = state.items.find(q => q.id === action.payload);
      if (question) {
        question.votes = (question.votes || 0) - 1;
      }
      if (state.currentQuestion && state.currentQuestion.id === action.payload) {
        state.currentQuestion.votes = (state.currentQuestion.votes || 0) - 1;
      }
    },
    revertUpvoteOptimistic: (state, action: PayloadAction<number>) => {
      const question = state.items.find(q => q.id === action.payload);
      if (question) {
        question.votes = (question.votes || 0) - 1;
      }
      if (state.currentQuestion && state.currentQuestion.id === action.payload) {
        state.currentQuestion.votes = (state.currentQuestion.votes || 0) - 1;
      }
    },
    revertDownvoteOptimistic: (state, action: PayloadAction<number>) => {
      const question = state.items.find(q => q.id === action.payload);
      if (question) {
        question.votes = (question.votes || 0) + 1;
      }
      if (state.currentQuestion && state.currentQuestion.id === action.payload) {
        state.currentQuestion.votes = (state.currentQuestion.votes || 0) + 1;
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
        state.items = action.payload.questions;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      
      // Fetch my questions
      .addCase(fetchMyQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.myQuestions = action.payload;
        } else if (action.payload && Array.isArray(action.payload.questions)) {
          state.myQuestions = action.payload.questions;
        } else {
          state.myQuestions = [];
        }
      })
      .addCase(fetchMyQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch your questions';
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
      // .addCase(upvoteQuestion.fulfilled, (state, action) => {
      //   // Optionally handle success response if backend returns updated vote count
      //   // This can be used to sync with server if needed
      // })
      .addCase(upvoteQuestion.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to upvote question';
      })
      
      // Downvote question
      // .addCase(downvoteQuestion.fulfilled, (state, action) => {
      //   // Optionally handle success response if backend returns updated vote count
      // })
      .addCase(downvoteQuestion.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to downvote question';
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
      });
  },
});

export const { 
  upvoteQuestionOptimistic,
  downvoteQuestionOptimistic,
  revertUpvoteOptimistic,
  revertDownvoteOptimistic,
  clearError, 
  setCurrentQuestion, 
  clearCurrentQuestion 
} = questionsSlice.actions;

export default questionsSlice.reducer;