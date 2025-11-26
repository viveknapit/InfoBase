import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Answer } from "../types";
import axios from "axios";


interface AnswersState {
  byId: Record<string, Answer>;
  idsByQuestion: Record<string, (string | number)[]>;
  loading: boolean;
  error?: string | null;
}

const initialState: AnswersState = {
  byId: {},
  idsByQuestion: {},
  loading: false,
  error: null,
};

export const fetchAnswers = createAsyncThunk<
  { questionId: string | number; answers: Answer[] },
  { questionId: string | number }
>("answers/fetch", async ({ questionId }) => {
    const res = await axios.get(`/dummyData.json`);
  // const res = await axios.get(`/api/questions/${questionId}/answers`);
  return { questionId, answers: res.data };
});

// post an answer
export const postAnswer = createAsyncThunk<
  { questionId: string | number; answer: Answer },
  { questionId: string | number; body: string }
>("answers/post", async ({ questionId, body }) => {
  const res = await axios.post(`/api/questions/${questionId}/answers`, { body });
  return { questionId, answer: res.data };
});


export const voteAnswer = createAsyncThunk<
  { answerId: string | number; newScore?: number },
  { answerId: string | number; delta: number }
>("answers/vote", async ({ answerId, delta }) => {
  const res = await axios.post(`/api/answers/${answerId}/vote`, { delta });
  return { answerId, newScore: res.data?.score };
});

/* --- Slice --- */
const slice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    // optimistic vote
    voteOptimistic: (state, action: PayloadAction<{ answerId: string | number; delta: number }>) => {
      const id = String(action.payload.answerId);
      const a = state.byId[id];
      if (a) a.score += action.payload.delta;
    },
    // optimistic accept
    acceptOptimistic: (state, action: PayloadAction<{ answerId: string | number }>) => {
      const aid = String(action.payload.answerId);
      const answer = state.byId[aid];
      if (!answer) return;
      const qid = String(answer.questionId);
      const ids = state.idsByQuestion[qid] ?? [];
      ids.forEach((id) => {
        const a = state.byId[String(id)];
        if (a) a.isAccepted = String(a.id) === aid;
      });
    },
    // remove answer locally (e.g., after delete)
    removeAnswerLocal: (state, action: PayloadAction<{ answerId: string | number }>) => {
      const aid = String(action.payload.answerId);
      const ans = state.byId[aid];
      if (!ans) return;
      const qid = String(ans.questionId);
      state.idsByQuestion[qid] = (state.idsByQuestion[qid] || []).filter((id) => String(id) !== aid);
      delete state.byId[aid];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnswers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAnswers.fulfilled, (s, action) => {
        const qid = String(action.payload.questionId);
        s.loading = false;
        s.idsByQuestion[qid] = action.payload.answers.map((a) => a.id);
        action.payload.answers.forEach((a) => {
          s.byId[String(a.id)] = a;
        });
      })
      .addCase(fetchAnswers.rejected, (s, action) => {
        s.loading = false;
        s.error = action.error.message ?? "Failed to fetch answers";
      })

      .addCase(postAnswer.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(postAnswer.fulfilled, (s, action) => {
        s.loading = false;
        const qid = String(action.payload.questionId);
        const a = action.payload.answer;
        s.byId[String(a.id)] = a;
        s.idsByQuestion[qid] = s.idsByQuestion[qid] ? [...s.idsByQuestion[qid], a.id] : [a.id];
      })
      .addCase(postAnswer.rejected, (s, action) => {
        s.loading = false;
        s.error = action.error.message ?? "Failed to post answer";
      })

      .addCase(voteAnswer.fulfilled, (s, action) => {
        const aid = String(action.payload.answerId);
        if (action.payload.newScore !== undefined && s.byId[aid]) {
          s.byId[aid].score = action.payload.newScore;
        }
      })
      .addCase(voteAnswer.rejected, (s, action) => {
        s.error = action.error.message ?? "Vote failed";
      });
  },
});

/* --- Exports --- */
export const { voteOptimistic, acceptOptimistic, removeAnswerLocal } = slice.actions;
export default slice.reducer;

/* --- Selectors --- */
export const selectAnswersState = (root: { answers: AnswersState }) => root.answers;
export const selectAnswersForQuestion = (root: { answers: AnswersState }, questionId: string | number) => {
  const ids = root.answers.idsByQuestion[String(questionId)] ?? [];
  return ids.map((id) => root.answers.byId[String(id)]);
};
export const selectAnswerById = (root: { answers: AnswersState }, answerId: string | number) =>
  root.answers.byId[String(answerId)];
