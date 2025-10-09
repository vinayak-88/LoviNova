import { useState } from "react";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate()
  const apiUrl = process.env.API_URL;

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await axios.post(apiUrl + "/forgotpassword", {
        emailId: data.email,
      });

      if (res.status === 200) {
        setSuccessMessage("Password reset OTP sent to your email ✅");
        navigate("/verifyotp", { state: { email: data.email } })
      } else {
        setErrorMessage(res.data.message || "Failed to send OTP ❌");
      }
    } catch (err) {
      setErrorMessage(err.response ? err.response.data.message : err.message);
    }

    setLoading(false);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 shadow-lg">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Forgot Password
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Enter your email and we'll send you a reset link or OTP.
            </p>
          </div>

          {/* Feedback */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-input rounded-md text-sm sm:text-base focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
