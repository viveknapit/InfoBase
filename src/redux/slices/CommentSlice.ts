// redux/slices/CommentSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Comment, CommentPayload } from '../../services/Payload';
import {
  getCommentsForQuestionApi,
  createCommentForQuestionApi,
  deleteCommentApi,
  getCommentsForAnswerApi,
  createCommentForAnswerApi
} from '../../services/CommentService';
import type { RootState } from '../store';

type CommentsState = {
  byQuestion: Record<number, Comment[]>;
  byAnswer: Record<number, Comment[]>;
  loading: boolean;
  error: string | null;
};

const initialState: CommentsState = {
  byQuestion: {},
  byAnswer: {},
  loading: false,
  error: null,
};

export const fetchCommentsForQuestion = createAsyncThunk(
  'comments/fetchCommentsForQuestion',
  async (questionId: number) => {
    const comments = await getCommentsForQuestionApi(questionId);
    return { questionId, comments };
  }
);

export const fetchCommentsForAnswer = createAsyncThunk(
  'comments/fetchCommentsForAnswer',
  async (answerId: number) => {
    const comments = await getCommentsForAnswerApi(answerId);
    return { answerId, comments };
  }
);

/**
 * Create comment specifically for a question.
 * payload should include at least { questionId, text, ... }
 */
export const createCommentForQuestion = createAsyncThunk(
  'comments/createCommentForQuestion',
  async (payload: CommentPayload) => {
    const comment = await createCommentForQuestionApi(payload);
    return comment;
  }
);

/**
 * Create comment specifically for an answer.
 * payload should include at least { answerId, text, ... }
 */
export const createCommentForAnswer = createAsyncThunk(
  'comments/createCommentForAnswer',
  async (payload: CommentPayload) => {
    const comment = await createCommentForAnswerApi(payload);
    return comment;
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId: number) => {
    await deleteCommentApi(commentId);
    return commentId;
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearCommentsForQuestion: (state, action: PayloadAction<number>) => {
      delete state.byQuestion[action.payload];
    },
    clearCommentsForAnswer: (state, action: PayloadAction<number>) => {
      delete state.byAnswer[action.payload];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch question
      .addCase(fetchCommentsForQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsForQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.byQuestion[action.payload.questionId] = Array.isArray(action.payload.comments)
          ? (action.payload.comments as unknown as Comment[]).slice()
          : [];
      })
      .addCase(fetchCommentsForQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })

      // fetch answer
      .addCase(fetchCommentsForAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsForAnswer.fulfilled, (state, action) => {
        state.loading = false;
        state.byAnswer[action.payload.answerId] = Array.isArray(action.payload.comments)
          ? (action.payload.comments as unknown as Comment[]).slice()
          : [];
      })
      .addCase(fetchCommentsForAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })

      // create for question
      .addCase(createCommentForQuestion.pending, (state) => {
        state.error = null;
      })
      .addCase(createCommentForQuestion.fulfilled, (state, action) => {
        // action.payload: Comment returned by API
        // action.meta.arg: original CommentPayload (may include questionId)
        const returned = action.payload as unknown as Comment | undefined | null;
        const originalPayload = action.meta?.arg as CommentPayload | undefined;
        const qId = originalPayload?.parentId ?? (returned && (returned.parentId as number)) ?? undefined;
        if (!qId) {
          console.warn('[comments] createCommentForQuestion.fulfilled: missing questionId', action);
          return;
        }
        if (!state.byQuestion[qId]) state.byQuestion[qId] = [];
        if (returned && typeof returned.id === 'number') state.byQuestion[qId].push(returned);
      })
      .addCase(createCommentForQuestion.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create comment for question';
      })

      // create for answer
      .addCase(createCommentForAnswer.pending, (state) => {
        state.error = null;
      })
      .addCase(createCommentForAnswer.fulfilled, (state, action) => {
        const returned = action.payload as unknown as Comment | undefined | null;
        const originalPayload = action.meta?.arg as CommentPayload | undefined;
        const aId = originalPayload?.parentId ?? (returned && (returned.parentId as number)) ?? undefined;
        if (!aId) {
          console.warn('[comments] createCommentForAnswer.fulfilled: missing answerId', action);
          return;
        }
        if (!state.byAnswer[aId]) state.byAnswer[aId] = [];
        if (returned && typeof returned.id === 'number') state.byAnswer[aId].push(returned);
      })
      .addCase(createCommentForAnswer.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create comment for answer';
      })

      // delete
      .addCase(deleteComment.fulfilled, (state, action) => {
        const id = action.payload as number;
        for (const qIdStr of Object.keys(state.byQuestion)) {
          const qId = Number(qIdStr);
          state.byQuestion[qId] = state.byQuestion[qId].filter(c => c.id !== id);
        }
        for (const aIdStr of Object.keys(state.byAnswer)) {
          const aId = Number(aIdStr);
          state.byAnswer[aId] = state.byAnswer[aId].filter(c => c.id !== id);
        }
      });
  }
});

export const { clearCommentsForQuestion, clearCommentsForAnswer } = commentsSlice.actions;

export const selectCommentsForQuestion = (state: RootState, questionId: number) =>
  state.comments.byQuestion[questionId] || [];

export const selectCommentsForAnswer = (state: RootState, answerId: number) =>
  state.comments.byAnswer[answerId] || [];

export default commentsSlice.reducer;
