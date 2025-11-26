import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockApi } from '../../services/mockApi';

interface TagsState {
  allTags: string[];
  popularTags: Array<{ name: string; count: number }>;
  isLoading: boolean;
  error: string | null;
}

export const fetchAllTags = createAsyncThunk(
  'tags/fetchAll',
  async () => {
    return await mockApi.tags.getAll();
  }
);

export const fetchPopularTags = createAsyncThunk(
  'tags/fetchPopular',
  async (limit: number = 10) => {
    return await mockApi.tags.getPopular(limit);
  }
);

export const searchTags = createAsyncThunk(
  'tags/search',
  async (query: string) => {
    return await mockApi.tags.search(query);
  }
);

const initialState: TagsState = {
  allTags: [],
  popularTags: [],
  isLoading: false,
  error: null
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearTagsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTags.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTags = action.payload;
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tags';
      })
      .addCase(fetchPopularTags.fulfilled, (state, action) => {
        state.popularTags = action.payload;
      })
      .addCase(searchTags.fulfilled, (state, action) => {
        state.allTags = action.payload;
      });
  }
});

export const { clearTagsError } = tagsSlice.actions;
export default tagsSlice.reducer;