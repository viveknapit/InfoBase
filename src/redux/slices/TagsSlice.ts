import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAll } from '../../services/TagsServices';

// Tag interface
export interface Tag {
  id: number;
  name: string;
}

interface TagsState {
  allTags: Tag[];
  isLoading: boolean;
  error: string | null;
}

// Async thunk using your API function
export const getAllTags = createAsyncThunk(
  'tags/getAll',
  async () => {
    const data = await getAll();
    return data;
  }
);

const initialState: TagsState = {
  allTags: [],
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
      .addCase(getAllTags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTags = action.payload;
      })
      .addCase(getAllTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tags';
      });
  }
});

export const { clearTagsError } = tagsSlice.actions;
export default tagsSlice.reducer;