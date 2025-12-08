import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getAnswerByQId } from "../../services/QuestionService";
import type { Answer } from "../types";


interface AnswersState {
  byId: Record<string, Answer>;
  idsByQuestion: Record<string, (string | number)[]>;
  loading: boolean;
  error: string | null;
}

const initialState: AnswersState = {
  byId: {},
  idsByQuestion: {},
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAnswers = createAsyncThunk<
  { questionId: number; answers: Answer[] },
  { questionId: number }
>("answers/fetch", async ({ questionId }) => {
  const res = await getAnswerByQId(questionId);
  return { questionId, answers: res.data.answers };
});

// Slice
const answersSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    addAnswer: (state, action: PayloadAction<{ questionId: string | number; answer: Answer }>) => {
      const { questionId, answer } = action.payload;
      const qid = String(questionId);
      const aid = String(answer.id);
      
      state.byId[aid] = answer;
      if (!state.idsByQuestion[qid]) {
        state.idsByQuestion[qid] = [];
      }
      state.idsByQuestion[qid].push(answer.id);
    },

    updateVote: (state, action: PayloadAction<{ answerId: string | number; votes: number }>) => {
      const aid = String(action.payload.answerId);
      const answer = state.byId[aid];
      if (answer) {
        answer.votes = action.payload.votes;
      }
    },

    updateAccepted: (state, action: PayloadAction<{ answerId: string | number }>) => {
      const aid = String(action.payload.answerId);
      const answer = state.byId[aid];
      if (!answer) return;

      const qid = String(answer.questionId);
      const ids = state.idsByQuestion[qid] ?? [];

      ids.forEach((id) => {
        const ans = state.byId[String(id)];
        if (ans) {
          ans.accepted = String(ans.id) === aid;
        }
      });
    },

    removeAnswer: (state, action: PayloadAction<{ answerId: string | number }>) => {
      const aid = String(action.payload.answerId);
      const answer = state.byId[aid];
      if (!answer) return;

      const qid = String(answer.questionId);
      state.idsByQuestion[qid] = (state.idsByQuestion[qid] || []).filter(
        (id) => String(id) !== aid
      );
      delete state.byId[aid];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnswers.fulfilled, (state, action) => {
        state.loading = false;
        const qid = String(action.payload.questionId);
        state.idsByQuestion[qid] = action.payload.answers.map((a) => a.id);
        action.payload.answers.forEach((a) => {
          state.byId[String(a.id)] = a;
        });
      })
      .addCase(fetchAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch answers";
      });
  },
});

export const { addAnswer, updateVote, updateAccepted, removeAnswer } = answersSlice.actions;

export default answersSlice.reducer;

// Selectors
export const selectAnswersForQuestion = (
  state: { answers: AnswersState },
  questionId: string | number
): Answer[] => {
  const ids = state.answers.idsByQuestion[String(questionId)] ?? [];
  return ids.map((id) => state.answers.byId[String(id)]).filter(Boolean);
};

export const selectAnswerById = (
  state: { answers: AnswersState },
  answerId: string | number
): Answer | undefined => state.answers.byId[String(answerId)];