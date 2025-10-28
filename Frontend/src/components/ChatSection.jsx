import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios"; // Import axios
import {
  Search,
  MessageCircle,
  Heart,
  ArrowLeft,
  MoreVertical,
  User,
  ShieldX,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import ImageWithFallback from "../utils/ImageWithFallBack";
import UserProfile from "./UserProfile";

const socket = io(process.env.API_URL, {
  withCredentials: true,
});

const apiUrl = process.env.API_URL; // Example URL

// --- Helper Functions ---
const formatTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ChatSection() {
  // --- State Management ---
  const LOGGED_IN_USER_ID = useSelector((state) => state.user.user._id); // Placeholder ID

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = React.useState({
    show: false,
    message: "",
    type: "success",
  });
  const [allMyMessagesRead, setAllMyMessagesRead] = useState(false);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    if (LOGGED_IN_USER_ID) {
      socket.emit("userOnline", LOGGED_IN_USER_ID);
    }
  }, [LOGGED_IN_USER_ID]);

  useEffect(() => {
    const handleReceiveMessage = ({ senderId, message }) => {
      const isFromOtherUser = senderId !== LOGGED_IN_USER_ID;
      if (selectedChat && selectedChat.otherUser._id === senderId) {
        setMessages((prev) => [...prev, message]);
        setChats((prevChats) =>
          prevChats
            .map((chat) =>
              chat.otherUser._id === senderId
                ? {
                    ...chat,
                    lastMessage: message.text,
                    updatedAt: message.createdAt,
                    isUnread: isFromOtherUser && !(
                      selectedChat && selectedChat.otherUser._id === senderId
                    ),
                  }
                : chat
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      } else {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.otherUser._id === senderId ? { ...chat, isUnread: true } : chat
          )
        );
      }
    };

    const handleMessageRead = ({ conversationId }) => {
      if (selectedChat && selectedChat.conversationId === conversationId) {
        setAllMyMessagesRead(true);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageRead", handleMessageRead);
    };
  }, [selectedChat?.conversationId]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(apiUrl + "/chats", {
          withCredentials: true,
        });
        const data = res.data.data || [];

        const transformedChats = data
          .map((convo) => {
            const participant = convo.participants[0];

            // Normalize otherUser shape
            const otherUser = {
              ...participant,
              name: `${participant.firstName || ""} ${
                participant.lastName || ""
              }`.trim(),
              avatar: participant?.profilePicture?.url || "/default-avatar.png",
            };

            return {
              conversationId: convo._id,
              otherUser,
              lastMessage: convo.lastMessage,
              updatedAt: convo.updatedAt,
              isUnread: convo.isUnread,
            };
          })
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setChats(transformedChats);
      } catch (err) {
        showNotification("Error fetching chats");
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, []);

  // Effect to fetch messages using axios
  useEffect(() => {
    if (!selectedChat?.conversationId) return;

    let ignore = false;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);

        const response = await axios.get(
          apiUrl + `/chat/${selectedChat.conversationId}`,
          { withCredentials: true }
        );

        if (!ignore) {
          const { data: fetchedMessages, allMyMessagesRead } = response.data;
          setMessages(fetchedMessages);
          setAllMyMessagesRead(allMyMessagesRead);

          setChats((prev) =>
            prev.map((c) =>
              c.conversationId === selectedChat.conversationId
                ? { ...c, isUnread: false }
                : c
            )
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch messages."
          );
        }
      } finally {
        if (!ignore) setLoadingMessages(false);
      }
    };

    fetchMessages();
    return () => {
      ignore = true;
    };
  }, [selectedChat?.conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setIsSending(true);

    try {
      const response = await axios.post(
        apiUrl + `/chat/${selectedChat.otherUser._id}/message`,
        { message: newMessage },
        { withCredentials: true }
      );

      const { data: sentMessage } = response.data;

      setMessages((prev) => [...prev, sentMessage]);

      setChats((prevChats) =>
        prevChats
          .map((chat) =>
            chat.conversationId === selectedChat.conversationId
              ? {
                  ...chat,
                  lastMessage: sentMessage.text,
                  updatedAt: sentMessage.createdAt,
                }
              : chat
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );

      socket.emit("sendMessage", {
        senderId: LOGGED_IN_USER_ID,
        receiverId: selectedChat.otherUser._id,
        message: sentMessage,
      });
      setAllMyMessagesRead(false);
      setNewMessage("");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to send message.";
      showNotification(message);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => msg.senderId !== LOGGED_IN_USER_ID && !msg.read
      );
      if (unreadMessages.length > 0) {
        socket.emit("messageRead", {
          conversationId: selectedChat.conversationId,
          receiverId: LOGGED_IN_USER_ID,
        });
        setChats((prev) =>
          prev.map((c) =>
            c.conversationId === selectedChat.conversationId
              ? { ...c, isUnread: false }
              : c
          )
        );
      }
    }
  }, [selectedChat, messages, LOGGED_IN_USER_ID]);

  // --- Derived State ---
  const filteredChats = chats.filter((chat) =>
    (chat.otherUser?.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (selectedChat) {
    const { otherUser } = selectedChat;
    return selectedUser ? (
      <UserProfile userId={selectedUser} onBack={() => setSelectedUser(null)} />
    ) : (
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 w-full flex flex-col font-sans">
        {/* Chat Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3 flex-shrink-0 justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="text-pink-600 hover:text-pink-700 p-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="relative">
              <ImageWithFallback
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{otherUser.name}</h3>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-800"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                <button
                  onClick={() => setSelectedUser(otherUser._id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <User className="w-4 h-4 mr-2" /> View Profile
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="bg-pink-100 px-4 py-2 rounded-full">
                  <p className="text-sm text-pink-700">
                    You matched with {otherUser.name}!
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={msg._id || i}
                    className={`flex ${
                      msg.senderId === LOGGED_IN_USER_ID ? "justify-end" : ""
                    }`}
                  >
                    <div
                      className={`${
                        msg.senderId === LOGGED_IN_USER_ID
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      } rounded-2xl px-4 py-2 max-w-xs`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span
                        className={`text-xs float-right mt-1 ${
                          msg.senderId === LOGGED_IN_USER_ID
                            ? "text-pink-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTimestamp(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {messages.length > 0 && (
                  <div className="text-center text-xs text-gray-400 mt-2 mb-2">
                    {allMyMessagesRead ? "Read ✅" : "Unread ❌"}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </main>

        {/* Message Input */}
        <footer className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2"
          >
            <input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="w-full h-11 px-4 bg-gray-100 border-transparent rounded-full focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3 hover:from-pink-600 hover:to-purple-700 transition-transform transform hover:scale-105 shadow-md disabled:opacity-50 disabled:scale-100"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
            </button>
          </form>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 w-full flex flex-col p-4 font-sans">
      {/* Header */}
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Messages
        </h1>
        <p className="text-gray-500">Connect with your matches</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6 flex-shrink-0">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
        />
      </div>

      {/* Chat List */}
      <main className="flex-1 space-y-2 overflow-y-auto pb-4">
        {loadingChats ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
            {error}
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.conversationId}
              onClick={() => {
                setSelectedChat(chat);
                setChats((prev) =>
                  prev.map((c) =>
                    c.conversationId === chat.conversationId
                      ? { ...c, isUnread: false } // clear unread as soon as you open the chat
                      : c
                  )
                );
              }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                  <ImageWithFallback
                    src={chat.otherUser.avatar}
                    alt={chat.otherUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-semibold truncate ${
                        chat.isUnread
                          ? "text-gray-900 font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {chat.otherUser.name}
                    </h3>
                    <span
                      className={`text-xs flex-shrink-0 ml-2 ${
                        chat.isUnread
                          ? "text-pink-600 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(chat.updatedAt)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate mt-1 ${
                      chat.isUnread
                        ? "text-gray-700 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.isUnread && (
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full flex-shrink-0 ml-2"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-700 mb-2">No Matches Yet</h3>
            <p className="max-w-xs">
              Start swiping to find your perfect match and begin conversations!
            </p>
          </div>
        )}
      </main>
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
