import { Routes, Route, NavLink } from "react-router-dom";
import axios from "axios";
import AuthRoute from "./utils/AuthRoute.js";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./utils/userSlice.js";
import { setAuth } from "./utils/authSlice.js";

import LoginPage from "./components/LoginPage.jsx";
import HomePage from "./components/HomePage.jsx";
import EmailVerification from "./components/EmailVerification.jsx";
import Body from "./components/Body.jsx";
import ShimmerCard from "./utils/ShimmerCard.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import VerifyForgotOtp from "./components/VerifyForgotOtp.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ErrorPage from "./components/ErrorPage.jsx";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.API_URL;
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(apiUrl + "/check-auth", {
        withCredentials: true,
      })
      .then((res) => {
        setIsAuthenticated(true);
        dispatch(setAuth(true));
        dispatch(setUser(res.data.data));
      })
      .catch(() => {
        setIsAuthenticated(false);
        dispatch(setAuth(false));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ShimmerCard />;

  return (
    <div className="w-full h-full">
      <Routes>
        <Route path="/verifyotp" element={<VerifyForgotOtp />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <AuthRoute isAuthenticated={isAuthenticated} restricted={true}>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/forgotpassword"
          element={
            <AuthRoute isAuthenticated={isAuthenticated} restricted={true}>
              <ForgotPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthRoute isAuthenticated={isAuthenticated} restricted={true}>
              <EmailVerification />
            </AuthRoute>
          }
        />

        <Route
          path="/foryou"
          element={
            <AuthRoute isAuthenticated={isAuthenticated} restricted={false}>
              <Body />
            </AuthRoute>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
};

export default App;
