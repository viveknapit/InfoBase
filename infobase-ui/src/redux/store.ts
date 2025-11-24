import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from './slices/QuestionsSlice';
import filterReducer from './slices/FilterSlice';
import commentsReducer from './slices/CommentSlice';
import answerReducer from './slices/AnswerSlice';

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    filters: filterReducer,
    comments: commentsReducer,
    answers: answerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;