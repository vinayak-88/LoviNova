import { useState } from "react";
import { Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../utils/userSlice";
import { setAuth } from "../utils/authSlice";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = process.env.API_URL;
  let res;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const genderValue = watch("gender", "");
  const lookingForValue = watch("lookingfor", "");

  const onSubmit = async (data) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (isLogin) {
      try {
        res = await axios.post(
          apiUrl + "/login",
          {
            emailId: data.email,
            password: data.password,
          },
          { withCredentials: true }
        );

        if (res.status == 200) {
          dispatch(setAuth(true));
          dispatch(setUser(res.data.data));
          setSuccessMessage("Login successful 🎉");
        }
      } catch (err) {
        setErrorMessage("Invalid Credentials ❌");
      }
    } else {
      try {
        res = await axios.post(apiUrl + "/signup", {
          firstName: data.firstname,
          lastName: data.lastname,
          gender: data.gender,
          emailId: data.email,
          password: data.password,
          lookingFor: data.lookingfor,
          age: parseInt(data.age),
          cityName: data.location,
        });
        if (res.status == 200)
          navigate("/verify-otp", { state: { email: data.email } });
        else setErrorMessage("Signup failed ❌");
      } catch (err) {
        if (err.response) {
          // backend actually responded with 500 and { message: "..." }
          setErrorMessage(err.response.data.message);
        } else {
          // request didn’t reach server (network issue etc.)
          setErrorMessage(err.message);
        }
      }
    }
    setLoading(false);
    reset(); // Clear form after submission
  };

  const handleForgotPassword = () => {
    navigate("/forgotpassword");
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    reset(); // Clear form when toggling
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Logo/Brand Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 shadow-lg">
              <Heart
                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                fill="white"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              LoviNova
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {isLogin ? "Find your perfect match" : "Create Your Profile"}
            </p>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 sm:space-y-6"
            >
              <div className="space-y-2">
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-input rounded-md text-sm sm:text-base focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-input rounded-md text-sm sm:text-base focus:ring-2 focus:ring-pink-300 focus:border-transparent transition"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-green-600 text-sm">{successMessage}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition transform hover:scale-105"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* ✅ Feedback messages */}
            </form>
          ) : (
            // Signup Form
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 sm:space-y-6"
            >
              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="First Name"
                    {...register("firstname", {
                      required: "Firstname is required",
                    })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md"
                  />
                  {errors.firstname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...register("lastname", {
                      required: "Lastname is required",
                    })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md"
                  />
                  {errors.lastname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <select
                  defaultValue=""
                  {...register("gender", {
                    required: "Please select a gender",
                  })}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md ${
                    genderValue === "" ? "text-gray-400" : "text-foreground"
                  }`}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-1">
                <input
                  type="number"
                  placeholder="Age"
                  {...register("age", {
                    required: "Age is required",
                    min: { value: 18, message: "You must be at least 18" },
                  })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md"
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Looking For */}
              <div className="space-y-1">
                <select
                  defaultValue=""
                  {...register("lookingfor", {
                    required: "Please make a selection",
                  })}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md ${
                    lookingForValue === "" ? "text-gray-400" : "text-foreground"
                  }`}
                >
                  <option value="" disabled>
                    Who are you looking for?
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Both">Both</option>
                </select>
                {errors.lookingfor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lookingfor.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Create a password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="City, State/Country"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-md"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {errorMessage && (
                <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition transform hover:scale-105"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Toggle Link */}
          <div className="text-center text-xs sm:text-sm space-y-2">
            {!isLogin ? (
              <p>
                Already have an account?{" "}
                <button
                  className="text-pink-600 underline"
                  onClick={toggleForm}
                >
                  Login
                </button>
              </p>
            ) : (
              <p>
                Don’t have an account?{" "}
                <button
                  className="text-pink-600 underline"
                  onClick={toggleForm}
                >
                  Sign up
                </button>
              </p>
            )}

            {isLogin && (
              <>
                <p>
                  <button
                    className="text-purple-600 underline"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    {loading ? "Sending Otp" : "Forgot Password?"}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
