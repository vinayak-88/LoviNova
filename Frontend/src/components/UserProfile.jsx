import React from "react";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Trash2,
  Shield,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import axios from "axios";
import ImageWithFallback from "../utils/ImageWithFallBack";

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{children}</p>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserProfile({ userId, onBack }) {
  const [displayUser, setDisplayUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [modal, setModal] = React.useState({ isOpen: false, type: null });
  const [notification, setNotification] = React.useState({
    show: false,
    message: "",
    type: "success",
  });
  const [newMessage, setNewMessage] = React.useState("");
  const menuRef = React.useRef(null);

  const apiUrl = process.env.API_URL;

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
  };

  React.useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 2500); // 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(apiUrl + `/profile/user/view/${userId}`, {
        withCredentials: true,
      });
      if (res.status === 200)
        setDisplayUser({
          ...res.data.data,
          canRemove: res.data.connectionExist,
          matchId: res.data.connectionId,
        });
    } catch (err) {
      setError("Failed to fetch user data.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUserData();
  }, []);

  // --- EVENT HANDLERS ---
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (type) => {
    setMenuOpen(false);
    setModal({ isOpen: true, type: type });
  };

  const handleMessage = async () => {
    if (!displayUser.canRemove)
      showNotification("Please add user to send message", "info");
    else {
      try {
        // axios.post takes the URL and the data payload object
        const response = await axios.post(
          apiUrl + `/chat/${displayUser._id}/message`,
          {
            message: newMessage,
          },
          { withCredentials: true }
        );
        if (response.status === 200)
          showNotification(
            "Message sent, Please go to chat section for chatting",
            "info"
          );
      } catch (err) {
        showNotification("Error Sending Message");
      }
    }
  };

  const confirmAction = async (action) => {
    if (action === "add") {
      try {
        const res = await axios.post(
          apiUrl + `/request/send/interested/${displayUser._id}`,
          {},
          { withCredentials: true }
        );
        if (res.status === 200) {
          showNotification(
            `connection request sent to ${
              displayUser.firstName + " " + displayUser.lastName
            }`,
            "success"
          );
        }
      } catch (err) {
        if(err.response.data.message==="Request already exist") showNotification(
          `Connection request already exists`,
          "info"
        );
        else
        showNotification(
          `Error sending connection request to ${
            displayUser.firstName + " " + displayUser.lastName
          }`,
          "info"
        );
      }
    } else if (action === "remove") {
      try {
        const res = await axios.delete(
          apiUrl + `/user/connections/removeconnection/${displayUser._id}`,
          { withCredentials: true }
        );
        if (res.status === 200) {
          showNotification(
            `${
              displayUser.firstName + " " + displayUser.lastName
            } has been ${action}d.`,
            "success"
          );
          setDisplayUser((prev) => ({ ...prev, canRemove: false, matchId: 0 }));
        }
      } catch (err) {
        showNotification(
          `${
            displayUser.firstName + " " + displayUser.lastName
          } has been ${action}d.`,
          "info"
        );
      }
    } else if (action === "block") {
      try {
        const res = await axios.post(
          apiUrl + "/block",
          {
            blocked: displayUser._id,
          },
          { withCredentials: true }
        );

        if (res.status === 200) setError("Failed to fetch user data.");
      } catch (err) {
        showNotification("Trouble Blocking user", "info");
      }
    }
    setModal({ isOpen: false, type: null });
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-semibold">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (displayUser) {
      return (
        <main className="flex-1 overflow-y-auto">
          <div className="relative pb-16">
            <div className="h-48 sm:h-56 md:h-72 bg-gray-200">
              <ImageWithFallback
                src={displayUser?.profilePicture?.url}
                alt={displayUser?.firstName + " " + displayUser?.lastName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative bg-white rounded-2xl shadow-lg p-4 sm:p-6 -mt-14 sm:-mt-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-5">
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full ring-4 ring-white overflow-hidden mx-auto sm:mx-0">
                      <ImageWithFallback
                        src={displayUser?.profilePicture?.url}
                        alt={
                          displayUser?.firstName + " " + displayUser?.lastName
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:min-w-0 sm:flex-1 text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                      {displayUser?.firstName + " " + displayUser?.lastName},{" "}
                      {displayUser?.age}
                    </h1>
                    <div className="flex justify-center sm:justify-start items-center mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span>{displayUser?.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border rounded-l-lg px-3 py-2 text-sm"
                    />
                    <button
                      className="h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
                      onClick={handleMessage}
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{" "}
                      Send Message
                    </button>
                  </div>
                </div>

                {/* ABOUT + DETAILS */}
                <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {displayUser?.bio}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                      Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                          Gender
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {displayUser?.gender}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                          Looking For
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {displayUser?.lookingFor}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return null;
  };

  return (
    <div className="w-full bg-gray-50 flex flex-col font-sans antialiased">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 py-3 px-4 sm:px-6 z-20 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <div className="relative" ref={menuRef}>
            {!isLoading && !error && displayUser && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <MoreHorizontal className="w-6 h-6 text-gray-700" />
              </button>
            )}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-100">
                {displayUser.canRemove ? (
                  <button
                    onClick={() => handleAction("remove")}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3" /> Remove Connection
                  </button>
                ) : (
                  <button
                    onClick={() => confirmAction("add")}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-3" /> Send Request
                  </button>
                )}
                <button
                  onClick={() => handleAction("block")}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-3" /> Block User
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {renderContent()}

      {displayUser && (
        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, type: null })}
          onConfirm={() => confirmAction(modal.type)}
          title={modal.type === "remove" ? "Remove Connection?" : "Block User?"}
        >
          {modal.type === "remove"
            ? `Are you sure you want to remove ${
                displayUser.firstName + displayUser.lastName
              } from your connections?`
            : `Are you sure you want to block ${
                displayUser.firstName + displayUser.lastName
              }? This action cannot be undone.`}
        </Modal>
      )}
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
    </div>
  );
}
