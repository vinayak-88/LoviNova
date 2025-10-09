import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";

const VerifyForgotOtp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.API_URL;

  const email = location.state?.email; // passed from ForgotPassword page
  if (!email) return <Navigate to="/forgotpassword" replace />;

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await axios.post(apiUrl + "/forgotpassword/verifyotp", {
        emailId: email,
        otp: data.otp,
      });

      if (res.status === 200) {
        setSuccessMessage("OTP verified ✅ Redirecting...");
        // save token (temporary)
        localStorage.setItem("resetToken", res.data.token);
        setTimeout(() => navigate("/resetpassword"), 1200);
      }
    } catch (err) {
      setErrorMessage(err.response ? err.response.data.message : err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 shadow-lg">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Verify OTP
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Enter the OTP sent to <b>{email}</b>
            </p>
          </div>

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              {...register("otp", { required: "OTP is required" })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-300"
            />
            {errors.otp && <p className="text-red-500 text-xs">{errors.otp.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyForgotOtp;
