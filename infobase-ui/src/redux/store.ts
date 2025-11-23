import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from './slices/QuestionsSlice';
import filterReducer from './slices/FilterSlice';

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    filters: filterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;