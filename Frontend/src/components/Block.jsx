import { useState, useEffect } from "react";
import {
  ArrowLeft,
  UserX,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import ImageWithFallback from "../utils/ImageWithFallBack"

export default function Block({onBack}) {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockUser, setUnblockUser] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  const apiUrl = process.env.API_URL;

  const handleUnBlockClick = (user) => {
    setUnblockUser(user);
    setIsModalOpen(true);
  };

  const showNotification = (message) => {
  setNotification({ show: true, message });
  setTimeout(() => {
    setNotification({ show: false, message: "" });
  }, 2000); // 3 seconds
};

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const res = await axios.get(apiUrl + "/blocklist/view", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setBlockedUsers(res.data.data);
          setIsLoading(false);
        }
      } catch (err) {
         showNotification("Trouble loading blocklist");
      }
    };
    fetchBlockedUsers();
  }, []);

  const handleUnblockUser = async (userId, userName) => {
    try {
      const res = await axios.post(
        apiUrl + "/unblock",
        {
          _id: userId,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        showNotification(`${userName} has been unblocked successfully.`);
        setBlockedUsers((prev) => prev.filter((user) => user.blocked._id !== userId));
        setIsModalOpen(false)
      }
    } catch (err) {
       showNotification(`Trouble Unblocking ${userName}`);
    }
  };

  return (
    <div className="h-full flex flex-col p-2 sm:p-4 bg-gray-50 font-sans">
  {/* Header */}
  <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
    <div className="flex items-center">
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-200 rounded-full mr-2 sm:mr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Blocklist
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {!isLoading &&
            `${blockedUsers.length} blocked ${
              blockedUsers.length === 1 ? "user" : "users"
            }`}
        </p>
      </div>
    </div>
  </header>

  {/* Blocked Users List */}
  <main className="flex-1">
    {isLoading ? (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm sm:text-base">
          Loading blocked users...
        </p>
      </div>
    ) : blockedUsers.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-4">
        <div className="p-3 sm:p-4 rounded-full bg-gray-100 mb-4">
          <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          No blocked users
        </h3>
        <p className="text-gray-500 text-sm sm:text-base max-w-xs sm:max-w-sm">
          You haven't blocked anyone yet. When you do, they won't be able to
          contact you or see your profile.
        </p>
      </div>
    ) : (
      <div className="space-y-2 sm:space-y-3">
        {blockedUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-3 gap-3 sm:gap-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <ImageWithFallback
                  src={user.blocked.profilePicture.url}
                  alt={user.blocked.firstName + " " + user.blocked.lastName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                  <UserX className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                  {user.blocked.firstName + " " + user.blocked.lastName}
                </h3>
              </div>

              {/* Unblock button */}
              <button
                onClick={() => handleUnBlockClick(user)}
                className="w-full sm:w-auto mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Unblock
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </main>

  {/* Footer */}
  {!isLoading && blockedUsers.length > 0 && (
    <footer className="mt-4 sm:mt-6 bg-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
      <div className="flex items-start space-x-3">
        <div className="p-1 rounded-full bg-blue-100 flex-shrink-0 mt-1">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
            About Blocking
          </h4>
          <p className="text-xs sm:text-sm text-blue-700">
            Blocked users cannot see your profile, send you messages, or
            interact with your content. Unblocking will restore their ability
            to contact you.
          </p>
        </div>
      </div>
    </footer>
  )}

  {/* Notification Toast */}
      <div
        className={`absolute z-50 top-5 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out ${
          notification.show
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10"
        }`}
      >
        <div className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-full shadow-lg">
          <CheckCircle className="w-5 h-5 mr-2" />
          <p>{notification.message}</p>
        </div>
      </div>

  {/* Modal */}
  {isModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md text-center">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          UnBlock User
        </h3>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          {`Are you sure you want to Unblock ${
            unblockUser.blocked.firstName + " " + unblockUser.blocked.lastName
          }`}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex-1 h-10 sm:h-11 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-full bg-white hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleUnblockUser(
                unblockUser.blocked._id,
                unblockUser.blocked.firstName +
                  " " +
                  unblockUser.blocked.lastName
              )
            }
            className="flex-1 h-10 sm:h-11 px-3 sm:px-4 py-2 text-white font-semibold rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            UnBlock
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
