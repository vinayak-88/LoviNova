import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import authReducer from "./authSlice"
import feedReducer from "./feedSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    feed: feedReducer
  },
});
