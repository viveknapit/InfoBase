// commentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Comment, ParentType } from "../types";
import axios from "axios";

interface CommentsState {
  byParent: Record<string, Comment[]>; // key = `${parent_type}:${parent_id}`
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
}

const initialState: CommentsState = {
  byParent: {},
  loading: {},
  error: {},
};

// helper to make key
const makeKey = (parent_type: ParentType, parent_id: string | number) =>
  `${parent_type}:${parent_id}`;

/* Thunks */

// fetch comments for parent
export const fetchComments = createAsyncThunk<
  { parent_type: ParentType; parent_id: string | number; comments: Comment[] },
  { parent_type: ParentType; parent_id: string | number; limit?: number; after?: string }
>("comments/fetch", async ({ parent_type, parent_id, limit = 20, after }) => {
  const res = await axios.get(`/api/comments/${parent_type}/${parent_id}`, {
    params: { limit, after },
  });
  return { parent_type, parent_id, comments: res.data.comments };
});

// post a comment
export const postComment = createAsyncThunk<
  { parent_type: ParentType; parent_id: string | number; comment: Comment },
  { parent_type: ParentType; parent_id: string | number; body: string; tempId?: string }
>("comments/post", async ({ parent_type, parent_id, body }) => {
  const res = await axios.post(`/api/comments`, { parent_type, parent_id, body });
  return { parent_type, parent_id, comment: res.data };
});

// edit a comment
export const editComment = createAsyncThunk<
  { comment: Comment },
  { id: string | number; body: string; parent_type: ParentType; parent_id: string | number }
>("comments/edit", async ({ id, body }) => {
  const res = await axios.put(`/api/comments/${id}`, { body });
  return { comment: res.data };
});

// delete comment
export const deleteComment = createAsyncThunk<
  { id: string | number },
  { id: string | number; parent_type?: ParentType; parent_id?: string | number }
>("comments/delete", async ({ id }) => {
  await axios.delete(`/api/comments/${id}`);
  return { id };
});



const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addCommentOptimistic: (
      state,
      action: PayloadAction<{ parent_type: ParentType; parent_id: string | number; tempComment: Comment }>
    ) => {
      const { parent_type, parent_id, tempComment } = action.payload;
      const key = makeKey(parent_type, parent_id);
      state.byParent[key] = [...(state.byParent[key] || []), tempComment];
    },

    
    removeTempComment: (
      state,
      action: PayloadAction<{ parent_type: ParentType; parent_id: string | number; tempId: string }>
    ) => {
      const { parent_type, parent_id, tempId } = action.payload;
      const key = makeKey(parent_type, parent_id);
      state.byParent[key] = (state.byParent[key] || []).filter((c) => String(c.id) !== String(tempId));
    },
  },
  extraReducers: (builder) => {
    // fetchComments
    builder.addCase(fetchComments.pending, (state, action) => {
      const { parent_type, parent_id } = action.meta.arg;
      const key = makeKey(parent_type, parent_id);
      state.loading[key] = true;
      state.error[key] = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      const { parent_type, parent_id, comments } = action.payload;
      const key = makeKey(parent_type, parent_id);
      state.loading[key] = false;
      state.byParent[key] = comments;
      state.error[key] = null;
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      const { parent_type, parent_id } = action.meta.arg;
      const key = makeKey(parent_type, parent_id);
      state.loading[key] = false;
      state.error[key] = action.error.message || "Failed to load";
    });

    // postComment
    builder.addCase(postComment.pending, (state, action) => {
      const { parent_type, parent_id } = action.meta.arg;
      const key = makeKey(parent_type, parent_id);
      state.loading[key] = true;
      state.error[key] = null;
    });
    builder.addCase(postComment.fulfilled, (state, action) => {
      const { parent_type, parent_id, comment } = action.payload;
      const key = makeKey(parent_type, parent_id);
      state.loading[key] = false;
      const existing = state.byParent[key] || [];
      // remove any pending comments (optional) and append server comment
      state.byParent[key] = [...existing.filter((c) => !c.pending), comment];
    });
    builder.addCase(postComment.rejected, (state, action) => {
      const { parent_type, parent_id } = action.meta.arg;
      const key = makeKey(parent_type, parent_id);
      state.loading[key] = false;
      state.error[key] = action.error.message || "Failed to post";
    });

    // editComment
    builder.addCase(editComment.fulfilled, (state, action) => {
      const comment = action.payload.comment;
      const key = makeKey(comment.parent_type as ParentType, comment.parent_id);
      state.byParent[key] = (state.byParent[key] || []).map((c) =>
        String(c.id) === String(comment.id) ? comment : c
      );
    });

    // deleteComment
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const { id } = action.payload;
      for (const key of Object.keys(state.byParent)) {
        state.byParent[key] = state.byParent[key].filter((c) => String(c.id) !== String(id));
      }
    });
  },
});


export const { addCommentOptimistic, removeTempComment } = commentsSlice.actions;
export default commentsSlice.reducer;

/* Selectors */
export const selectCommentsFor = (
  state: { comments: CommentsState },
  parent_type: ParentType,
  parent_id: string | number
) => state.comments.byParent[makeKey(parent_type, parent_id)] || [];
