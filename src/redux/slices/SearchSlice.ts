import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

// Types
interface SearchQuestion {
  id: number;
  title: string;
  descriptionSnippet: string;
  tags: string[];
  askedBy: {
    id: number;
    name: string;
    email: string;
  };
  votes: number;
  answersCount: number;
  views: number;
  createdAt: string;
}

interface SearchState {
  query: string;
  results: SearchQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: 'relevant' | 'recent' | 'votes' | 'answers' | 'views' | 'unanswered';
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  isSuggestionsLoading: boolean;
}

// Initial state
const initialState: SearchState = {
  query: '',
  results: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  sortBy: 'relevant',
  isLoading: false,
  error: null,
  suggestions: [],
  isSuggestionsLoading: false,
};

// Async thunk for main search
export const searchQuestions = createAsyncThunk(
  'search/searchQuestions',
  async (params: {
    query: string;
    page: number;
    limit: number;
    sortBy: string;
  }) => {
    const { query, page, limit, sortBy } = params;
    const response = await api.get('/api/questions/search', {
      params: { query, page, limit, sortBy },
    });
    return response.data.data;
  }
);

// Async thunk for autocomplete suggestions
export const fetchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async (query: string) => {
    if (!query || query.length < 2) {
      return [];
    }
    const response = await api.get('/api/questions/suggestions', {
      params: { query, limit: 5 },
    });
    return response.data;
  }
);

// Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SearchState['sortBy']>) => {
      state.sortBy = action.payload;
      state.page = 1; // Reset to first page on sort change
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.total = 0;
      state.page = 1;
      state.error = null;
      state.suggestions = [];
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    // Search questions
    builder
      .addCase(searchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.questions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.query = action.payload.query || '';
      })
      .addCase(searchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search questions';
        state.results = [];
      });

    // Fetch suggestions
    builder
      .addCase(fetchSuggestions.pending, (state) => {
        state.isSuggestionsLoading = true;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.isSuggestionsLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSuggestions.rejected, (state) => {
        state.isSuggestionsLoading = false;
        state.suggestions = [];
      });
  },
});

export const {
  setQuery,
  setPage,
  setLimit,
  setSortBy,
  clearSearch,
  clearSuggestions,
} = searchSlice.actions;

export default searchSlice.reducer;