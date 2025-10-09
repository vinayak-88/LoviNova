import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { isAuthenticated: false, loading: true },
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.loading = false;
    }
  }
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
