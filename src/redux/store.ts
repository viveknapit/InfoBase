import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from './slices/QuestionsSlice';
import filterReducer from './slices/FilterSlice';
import commentsReducer from './slices/CommentSlice';
import answerReducer from './slices/AnswerSlice';
import userReducer from './slices/UserSlice';
import tagsReducer from './slices/TagsSlice';
import projectsReducer from './slices/ProjectSlice';
import searchReducer from './slices/SearchSlice';

export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    filters: filterReducer,
    comments: commentsReducer,
    answers: answerReducer,
    users: userReducer,
    tags: tagsReducer,
    projects: projectsReducer,
    search : searchReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;