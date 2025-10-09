import { useState, useEffect } from "react";
import {
  LogOut,
  MessageSquare,
  Info,
  Bell,
  Heart,
  ChevronRight,
  CheckCircle,
  UserX,
} from "lucide-react";
import { useSelector } from "react-redux";
import MyProfile from "./MyProfile";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Block from "./Block";
import ImageWithFallback from "../utils/ImageWithFallBack";

const SettingsSection = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileClicked, setProfileClicked] = useState(false);
  const [blocklistClicked, setBlocklistClicked] = useState(false);

  const user = useSelector((state) => state.user.user);
  const [userProfile, setUserProfile] = useState(user);
  const navigate = useNavigate();
  const apiUrl = process.env.API_URL;

  // --- Effects ---
  // Effect to hide notification toast after a few seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    setUserProfile(user);
  }, [user]);

  // --- Event Handlers --

  const handleBlocklist = () => {
    setBlocklistClicked(true);
  };
  const showNotification = (message) => {
    setNotification({ show: true, message });
  };

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      const res = await axios.post(
        apiUrl + "/logout",
        {},
        { withCredentials: true }
      );
      if (res.status === 200) navigate("/");
    } catch (err) {
      setIsModalOpen(false);
      showNotification("Trouble Logging Out");
    }
  };

  const settingsItems = [
    {
      id: "notifications",
      icon: <Bell className="w-5 h-5" />,
      title: "Notifications",
      description: "Manage push and email alerts",
      action: () => showNotification("Notification settings coming soon!"),
    },
    {
      id: "blocklist",
      icon: <UserX className="w-5 h-5" />,
      title: "Blocklist",
      description: "Manage blocked users and connections",
      action: handleBlocklist,
    },
    {
      id: "contact",
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Contact Us",
      description: "Get help or share feedback",
      action: () => showNotification("Contact support: lovinovawork@gmail.com"),
    },
    {
      id: "about",
      icon: <Info className="w-5 h-5" />,
      title: "About Us",
      description: "Learn more about LoviNova",
      action: () => navigate("/"),
    },
    {
      id: "logout",
      icon: <LogOut className="w-5 h-5" />,
      title: "Logout",
      description: "Sign out of your account",
      action: handleLogoutClick,
      variant: "danger",
    },
  ];

  return (
    <>
      {profileClicked && <MyProfile onBack={() => setProfileClicked(false)} />}
      {blocklistClicked && <Block onBack={() => setBlocklistClicked(false)} />}
      {!profileClicked && !blocklistClicked && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 w-full min-h-screen flex flex-col font-sans relative">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex flex-col p-3 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                Manage your account and preferences
              </p>
            </header>

            {/* Profile Card */}
            <div
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 cursor-pointer"
              onClick={() => setProfileClicked(true)}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <ImageWithFallback
                    src={userProfile?.profilePicture?.url}
                    alt={userProfile.firstName + " " + userProfile.lastName}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                    <Heart
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white"
                      fill="currentColor"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl capitalize bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {userProfile.firstName + " " + userProfile.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-500">
                    Edit Profile
                  </p>
                </div>
              </div>
            </div>

            {/* Settings List */}
            <main className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 flex-1">
              {settingsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left ${
                    item.variant === "danger"
                      ? "hover:bg-red-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`p-2 sm:p-3 rounded-full ${
                      item.variant === "danger"
                        ? "bg-red-100 text-red-600"
                        : "bg-pink-100 text-pink-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm sm:text-base md:text-lg ${
                        item.variant === "danger"
                          ? "text-red-600"
                          : "text-gray-900"
                      } truncate`}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                      item.variant === "danger"
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </main>

            {/* App Version Footer */}
            <footer className="text-center mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
              <p className="text-xs text-gray-500">LoviNova v1.0.0</p>
              <p className="text-xs text-gray-400 mt-1">
                Made with ❤️ for meaningful connections
              </p>
            </footer>
          </div>

          {/* Custom Notification Toast */}
          <div
            className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out z-50 px-2 sm:px-0 ${
              notification.show
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-10"
            }`}
          >
            <div className="flex items-center bg-green-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg max-w-[90vw] sm:max-w-md">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <p className="truncate">{notification.message}</p>
            </div>
          </div>

          {/* Custom Logout Confirmation Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md text-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Are you sure you want to sign out?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-10 sm:h-11 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-full bg-white hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 h-10 sm:h-11 px-3 sm:px-4 py-2 text-white font-semibold rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SettingsSection;
