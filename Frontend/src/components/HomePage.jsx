import {
  Heart,
  Users,
  MessageCircle,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  function onGetStarted() {
    navigate("/login");
  }
  const features = [
    {
      icon: Heart,
      title: "Smart Matching",
      description:
        "Our AI algorithm finds your perfect matches based on compatibility and shared interests.",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description:
        "Your privacy is our priority with verified profiles and secure messaging.",
    },
    {
      icon: MessageCircle,
      title: "Meaningful Conversations",
      description:
        "Start conversations that matter with our guided conversation starters.",
    },
    {
      icon: Users,
      title: "Active Community",
      description:
        "Join millions of singles ready to find their perfect match.",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Create Your Profile",
      description:
        "Sign up and tell us about yourself to get personalized matches.",
    },
    {
      step: "2",
      title: "Get Matched",
      description: "Our smart algorithm finds compatible people near you.",
    },
    {
      step: "3",
      title: "Start Dating",
      description: "Chat, connect, and meet your perfect match!",
    },
  ];

  const testimonials = [
    {
      name: "Lorem & Ipsum",
      story:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      rating: 5,
      location: "Lorem, IP",
    },
    {
      name: "Dolor & Sit",
      story:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      rating: 5,
      location: "Amet, CS",
    },
    {
      name: "Consectetur & Elit",
      story:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      rating: 5,
      location: "Sed, DT",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LoviNova
              </span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-pink-600 font-medium"
              >
                How it Works
              </a>
              <a
                href="#success-stories"
                className="text-gray-600 hover:text-pink-600 font-medium"
              >
                Success Stories
              </a>
              <button
                onClick={onGetStarted}
                className="px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition transform hover:scale-105"
              >
                Sign In
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t border-pink-100 shadow-md rounded-b-xl">
            <div className="flex flex-col divide-y divide-gray-100">
              <a
                href="#how-it-works"
                className="px-6 py-4 text-gray-700 hover:text-pink-600 font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                How it Works
              </a>
              <a
                href="#success-stories"
                className="px-6 py-4 text-gray-700 hover:text-pink-600 font-medium transition"
                onClick={() => setMenuOpen(false)}
              >
                Success Stories
              </a>
              <div className="px-6 py-4">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onGetStarted();
                  }}
                  className="w-full px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent block">
                Perfect Match
              </span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with like-minded singles in your area. Our smart matching
              algorithm helps you find meaningful relationships that last.
            </p>
            <div className="flex justify-center">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center text-base sm:text-lg px-6 sm:px-8 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md transition transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Free to join • No hidden fees • Cancel anytime
            </p>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-16 sm:w-20 h-16 sm:h-20 bg-pink-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-12 sm:w-16 h-12 sm:h-16 bg-purple-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose LoviNova?
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              We're more than just a dating app. We're your partner in finding
              lasting love.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-lg border border-pink-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 bg-gradient-to-br from-pink-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Finding love has never been easier. Just three simple steps to
              your perfect match.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                  {step.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-6 sm:top-8 -right-3 sm:-right-4 lg:-right-8 w-5 sm:w-6 h-5 sm:h-6 text-pink-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Love Stories
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Real couples, real love stories. See how LoviNova brought these
              amazing people together.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg border border-pink-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  {testimonial.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                  {testimonial.location}
                </p>
                <p className="text-sm sm:text-base text-gray-600 italic">
                  "{testimonial.story}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ready to Find Your Match?
          </h2>
          <p className="text-base sm:text-xl text-pink-100 mb-6 sm:mb-8">
            Join thousands of singles who have found love on LoviNova. Your
            perfect match is waiting.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center text-base sm:text-lg px-6 sm:px-8 py-3 rounded-lg bg-white text-pink-600 hover:bg-gray-100 font-semibold shadow-md transition transform hover:scale-105"
          >
            Start Your Journey
            <Heart className="ml-2 w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row items-center justify-center flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 text-pink-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Free to Join
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Secure & Private
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Active Members
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 px-4">
        <p>&copy; {new Date().getFullYear()} LoviNova. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
