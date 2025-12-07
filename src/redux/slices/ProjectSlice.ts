import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import  type { Project } from '../types';

interface ProjectsState {
  allProjects: Project[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  allProjects: [],
  isLoading: false,
  error: null
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.allProjects = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProjectsError: (state) => {
      state.error = null;
    }
  }
});

export const { setProjects, setLoading, setError, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;