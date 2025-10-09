import React from "react";
import {
  Heart,
  X,
  MapPin,
  Users,
  Trash2,
  MoreHorizontal,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import UserProfile from "./UserProfile";
import ImageWithFallback from "../utils/ImageWithFallBack";
import {useDispatch} from "react-redux"
import { removeUser } from "../utils/feedSlice";

export default function MatchRequestsSection() {
  const [matchRequests, setMatchRequests] = React.useState([]);
  const [connections, setConnections] = React.useState([]);
  const [selectedProfile, setSelectedProfile] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState("requests");
  const [notification, setNotification] = React.useState({
    show: false,
    message: "",
    type: "success",
  });
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const menuRef = React.useRef(null);
  const dispatch = useDispatch()
  const apiUrl = process.env.API_URL;

  const notificationStyles = {
    success: {
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 border border-green-300",
    },
    error: {
      icon: XCircle,
      className: "bg-red-100 text-red-800 border border-red-300",
    },
    warning: {
      icon: AlertCircle,
      className: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    },
    info: {
      icon: Info,
      className: "bg-blue-100 text-blue-800 border border-blue-300",
    },
  };

  React.useEffect(() => {
    const getRequests = async () => {
      try {
        const res = await axios.get(apiUrl + `/user/requests/received`, {
          withCredentials: true,
        });
        if (res.status == 200) setMatchRequests(res.data.data);
      } catch (err) {}
    };

    const getConnections = async () => {
      try {
        const res = await axios.get(apiUrl + `/user/connections`, {
          withCredentials: true,
        });
        if (res.status == 200) setConnections(res.data.data);
      } catch (err) {}
    };

    getRequests();
    getConnections();
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        2500
      );
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const handleAccept = async (request) => {
    try {
      const res = await axios.patch(
        apiUrl + `/request/review/accepted/${request._id}`,
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        showNotification("Match request accepted", "success");
        setMatchRequests((prev) => prev.filter((r) => r._id !== request._id));
        dispatch(removeUser(request.senderId._id));
      }
    } catch (err) {
      showNotification("Something went wrong", "error");
    }
  };

  const handleReject = async (request) => {
    try {
      const res = await axios.patch(
        apiUrl + `/request/review/ignored/${request._id}`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        showNotification("Match request rejected", "success");
        setMatchRequests((prev) => prev.filter((r) => r._id !== request._id));
        dispatch(removeUser(request.senderId._id));
      }
    } catch (err) {
      showNotification("Something went wrong", "error");
    }
  };

  const handleActionOnProfile = async (otherUser, action) => {
    if (action === "remove") {
      try {
        const res = await axios.delete(
          apiUrl + `/user/connections/removeconnection/${otherUser._id}`,
          { withCredentials: true }
        );
        if (res.status === 200) {
          showNotification(
            `${
              otherUser.firstName + " " + otherUser.lastName
            } has been ${action}d.`,
            "success"
          );
          setConnections((prev) =>
            prev.filter((c) => c.otherUser._id !== otherUser._id)
          );
        }
      } catch (err) {
        showNotification("Something went wrong", "error");
      }
    } else if (action === "block") {
      try {
        const res = await axios.post(
          apiUrl + "/block",
          { blocked: otherUser._id },
          { withCredentials: true }
        );
        if (res.status === 200)
          showNotification(
            `${
              otherUser.firstName + " " + otherUser.lastName
            } has been ${action}ed.`,
            "success"
          );
        setConnections((prev) =>
          prev.filter((c) => c.otherUser._id !== otherUser._id)
        );
      } catch (err) {
        showNotification("Something went wrong", "error");
      }
    }
  };

  if (selectedProfile) {
    return (
      <UserProfile
        userId={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onSendMessage={() =>
          showNotification("Chat feature coming soon!", "info")
        }
      />
    );
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 relative font-sans">
      <header className="mb-6 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Matches
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your connections and requests
        </p>
      </header>

      <div className="flex-shrink-0 bg-gray-100 p-1 rounded-full grid grid-cols-2 gap-1 mb-6">
        <button
          onClick={() => setActiveTab("requests")}
          className={
            "px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors " +
            (activeTab === "requests"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-200")
          }
        >
          Requests ({matchRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("connections")}
          className={
            "px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors " +
            (activeTab === "connections"
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-200")
          }
        >
          Connections ({connections.length})
        </button>
      </div>

      <main className="flex-1 overflow-y-auto">
        {activeTab === "requests" && (
          <div className="space-y-4">
            {matchRequests.length > 0 ? (
              matchRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                    <ImageWithFallback
                      src={request.senderId.profilePicture.url}
                      alt={
                        request.senderId.firstName + request.senderId.lastName
                      }
                      className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover mx-auto sm:mx-0"
                    />
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-semibold text-base sm:text-lg">
                        {request.senderId.firstName + request.senderId.lastName}
                        , , {request.senderId.age}
                      </h3>
                      <div className="flex justify-center sm:justify-start items-center mt-1 text-xs sm:text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {request.senderId.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-3 line-clamp-2 text-center sm:text-left">
                    {request.senderId.bio}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={() => handleReject(request)}
                      className="flex-1 h-10 sm:h-11 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Pass
                    </button>
                    <button
                      onClick={() => handleAccept(request)}
                      className="flex-1 h-10 sm:h-11 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm"
                    >
                      <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                      Accept
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 text-gray-500">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                No new requests.
              </div>
            )}
          </div>
        )}
        {activeTab === "connections" && (
          <div className="space-y-4">
            {connections.length > 0 ? (
              connections.map((conn) => (
                <div
                  key={conn._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                    {/* Profile picture */}
                    <div
                      className="relative flex-shrink-0 cursor-pointer mx-auto sm:mx-0"
                      onClick={() => setSelectedProfile(conn.otherUser._id)}
                    >
                      <ImageWithFallback
                        src={conn.otherUser.profilePicture.url}
                        alt={conn.otherUser.firstName + conn.otherUser.lastName}
                        className="w-20 h-20 sm:w-14 sm:h-14 rounded-full object-cover"
                      />
                    </div>

                    {/* Name + location */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer text-center sm:text-left"
                      onClick={() => setSelectedProfile(conn.otherUser._id)}
                    >
                      <h3 className="font-semibold text-base sm:text-lg">
                        {conn.otherUser.firstName + conn.otherUser.lastName},{" "}
                        {conn.otherUser.age}
                      </h3>
                      <div className="flex justify-center sm:justify-start items-center mt-1 text-xs sm:text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {conn.otherUser.location}
                      </div>
                    </div>

                    {/* More menu */}
                    <div
                      className="relative flex justify-center sm:justify-end"
                      ref={openMenuId === conn._id ? menuRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === conn._id ? null : conn._id
                          );
                        }}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>

                      {openMenuId === conn._id && (
                        <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-100">
                          <button
                            onClick={() => {
                              handleActionOnProfile(conn.otherUser, "remove");
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-3" /> Remove
                            Connection
                          </button>
                          <button
                            onClick={() => {
                              handleActionOnProfile(conn.otherUser, "block");
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 mr-3" /> Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 text-gray-500">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                No connections yet.
              </div>
            )}
          </div>
        )}
      </main>
      <div
        className={
          "absolute top-5 left-1/2 -translate-x-1/2 transition-all duration-300 " +
          (notification.show
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10")
        }
      >
        <div
          className={`flex items-center ${
            notificationStyles[notification.type].className
          } text-sm font-bold px-4 py-3 rounded-full shadow-lg`}
        >
          {React.createElement(notificationStyles[notification.type].icon, {
            size: 20,
          })}
          <p>{notification.message}</p>
        </div>
      </div>
    </div>
  );
}
