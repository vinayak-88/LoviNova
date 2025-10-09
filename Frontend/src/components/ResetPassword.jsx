import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const apiUrl = process.env.API_URL;

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const token = localStorage.getItem("resetToken");
    if (!localStorage.getItem("resetToken")) {
      return <Navigate to="/forgotpassword" replace />;
    }

    try {
      const res = await axios.patch(
        apiUrl + "/resetpassword",
        { newPassword: data.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setSuccessMessage("Password reset successfully ✅ Redirecting...");
        localStorage.removeItem("resetToken");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setErrorMessage(err.response ? err.response.data.message : err.message);
    }

    setLoading(false);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 shadow-lg">
              <LockKeyhole className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Enter a new strong password
            </p>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm">{successMessage}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-300"
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
