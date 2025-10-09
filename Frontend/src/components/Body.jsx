import { useState } from "react";
import { Heart, MessageCircle, Settings, Users } from "lucide-react";
import FeedSection from "./FeedSection.jsx";
import MatchRequestSection from "./MatchRequestSection.jsx";
import ChatSection from "./ChatSection.jsx";
import SettingsSection from "./SettingsSection.jsx";

const Body = () => {
  const [activeSection, setActiveSection] = useState("feed");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "feed":
        return <FeedSection />;
      case "matches":
        return <MatchRequestSection />;
      case "chat":
        return <ChatSection />;
      case "settings":
        return <SettingsSection />;

      default:
        return <FeedSection />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      {/* This is the main content area that will change */}
      <main className="flex-1 overflow-auto">{renderActiveSection()}</main>

      {/* This is the persistent bottom navigation bar */}
      <nav className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around items-center">
          {/* Buttons to change the activeSection state */}
          <button
            onClick={() => setActiveSection("feed")}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeSection === "feed"
                ? "text-pink-600 bg-pink-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Heart
              className="w-5 h-5"
              fill={activeSection === "feed" ? "currentColor" : "none"}
            />
            <span className="text-xs">Feed</span>
          </button>
          <button
            onClick={() => setActiveSection("matches")}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors relative ${
              activeSection === "matches"
                ? "text-pink-600 bg-pink-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {" "}
            <div className="relative">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs">Matches</span>
          </button>
          <button
            onClick={() => setActiveSection("chat")}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeSection === "chat"
                ? "text-pink-600 bg-pink-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircle
              className="w-5 h-5"
              fill={activeSection === "chat" ? "currentColor" : "none"}
            />
            <span className="text-xs">Chat</span>
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeSection === "settings"
                ? "text-pink-600 bg-pink-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
          {/* ... chat and settings buttons */}
        </div>
      </nav>
    </div>
  );
};

export default Body;
