import { Heart, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmailVerified() {
  const navigate = useNavigate();
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md text-center">
        {/* Header with Logo */}
        <header className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              LoviNova
            </h1>
          </div>
        </header>

        {/* Main Content Card */}
        <main className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle
                className="w-12 h-12 text-green-500"
                strokeWidth={2}
              />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Email Verified Successfully!
          </h2>

          <p className="text-gray-600 mb-8">
            Your account is now active. You can now log in to find your perfect
            match.
          </p>

          <button
            onClick={handleLoginRedirect}
            className="w-full flex items-center justify-center h-12 px-6 text-base text-white font-semibold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Proceed to Login
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </main>
      </div>
    </div>
  );
}
