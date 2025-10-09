import { useState, useRef } from "react";
import { MailCheck } from "lucide-react";
import { set, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import axios from "axios";
import EmailVerified from "./EmailVerified";
import { Navigate } from "react-router-dom";

export default function EmailVerification() {
  const { handleSubmit } = useForm();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setErrorMessage] = useState(null);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState(null); // ✅ For resend feedback
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.API_URL;

  const inputRefs = useRef([]);
  const location = useLocation();
  const email = location.state?.email;
  if (!email) return <Navigate to="/login" replace />;


  const handleresend = async () => {
    setLoading(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      let res = await axios.post(apiUrl + "/resend-otp", { emailId: email });
      if (res.status === 200) {
        setMessage("OTP resent successfully ✅");
      } else {
        setErrorMessage(res.data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setErrorMessage("Failed to resend OTP");
    }
    setLoading(false);
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false; // Only allow numbers

    // Update OTP state
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmit = async () => {
    const enteredOtp = otp.join("");
    try {
      let res = await axios.post(apiUrl + "/verify-otp", {
        otp: enteredOtp,
        emailId: email,
      });
      if (res.status == 200) setVerified(true);
      else setErrorMessage(res.data.message || "Something went wrong");
    } catch (err) {
      if (err.response) {
        // backend actually responded with 500 and { message: "..." }
        setErrorMessage(err.response.data.message);
      } else {
        // request didn’t reach server (network issue etc.)
        setErrorMessage(err.message);
      }
    }
  };

  if (verified) {
    return <EmailVerified />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Icon Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 shadow-lg">
            <MailCheck className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              We've sent a 6-digit code to your email. Please enter it below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2 flex-wrap">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                />
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{error}</p>
            )}
            {message && (
              <p className="text-green-600 text-xs sm:text-sm mt-1">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition transform hover:scale-105"
            >
              Verify Email
            </button>
          </form>

          {/* Resend Code Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                disabled={loading}
                onClick={handleresend}
                className="text-pink-600 hover:text-pink-700 font-semibold underline"
              >
                {loading ? "Resending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
