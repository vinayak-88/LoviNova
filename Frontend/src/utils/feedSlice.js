// redux/feedSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  users: [],
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
};

const apiUrl = process.env.API_URL

export const fetchFeed = createAsyncThunk(
  "feed/fetchFeed",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page } = getState().feed;
      const res = await axios.get(apiUrl + `/feed?page=${page}&limit=10`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    resetFeed: () => ({ ...initialState }),

    // only remove user from local list (pure reducer)
    removeUser: (state, action) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;

        const incoming = action.payload?.data || [];
        // if backend returned no users, mark hasMore false to avoid retries
        if (!Array.isArray(incoming) || incoming.length === 0) {
          state.hasMore = false;
          return;
        }

        // append new users (avoid duplicates by id)
        const existingIds = new Set(state.users.map((u) => u.id));
        const filteredIncoming = incoming.filter((u) => !existingIds.has(u.id));
        state.users = [...state.users, ...filteredIncoming];

        // increment page only if we actually got results
        state.page += 1;

        // backend-provided flag is authoritative if present, otherwise infer
        if (typeof action.payload.hasMore === "boolean") {
          state.hasMore = action.payload.hasMore;
        } else {
          // fallback: if incoming length < limit => no more
          // (we don't have limit here; skip inference)
        }
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { removeUser, resetFeed } = feedSlice.actions;

// ---- thunk: remove user then conditionally fetch more ----
export const removeUserAndFetch = (id) => (dispatch, getState) => {
  dispatch(removeUser(id));

  const { users, hasMore, loading } = getState().feed;

  // If 0 or 1 user remains, and backend has more, and no fetch in progress -> fetch
  if (users.length <= 1 && hasMore && !loading) {
    dispatch(fetchFeed());
  }
};

export default feedSlice.reducer;
