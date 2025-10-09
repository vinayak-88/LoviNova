// FeedSection.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Heart, X, MapPin, CheckCircle, X } from "lucide-react";
import { fetchFeed, removeUser } from "../utils/feedSlice";
import axios from "axios";
import UserProfile from "./UserProfile";
import MyProfile from "./MyProfile";
import ImageWithFallback from "../utils/ImageWithFallBack";

const FeedSection = () => {
  const dispatch = useDispatch();
  const { users, loading, hasMore, error } = useSelector((s) => s.feed);
  const [selectedUser, setSelectedUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const userId = useSelector((state) => state.user.user._id);
  const apiUrl = process.env.API_URL;

  // Prevent double initial fetch in Strict Mode
  const didInitialFetch = useRef(false);
  useEffect(() => {
    if (!didInitialFetch.current) {
      didInitialFetch.current = true;
      if (users.length === 0 && !loading) dispatch(fetchFeed());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notification timeout
  useEffect(() => {
    if (notification.show) {
      const t = setTimeout(
        () => setNotification({ show: false, message: "" }),
        2000
      );
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    if (searchResults.length > 0) return searchResults; // from API
    if (!searchQuery) return users; // fallback to feed
    return []; // no results
  }, [users, searchResults, searchQuery]);

  const currentProfile = filteredProfiles[0] || null;

  const showNotification = (msg) =>
    setNotification({ show: true, message: msg });

  // Use the removeUserAndFetch thunk so fetch happens only if needed
  const handleSwipe = async (direction) => {
    if (!currentProfile) return;

    if (direction === "like") {
      setIsLiking(true);
      try {
        const res = await axios.post(
          apiUrl + `/request/send/interested/${currentProfile._id}`,
          {},
          {
            withCredentials: true,
          }
        );
        if (res.status == 200) {
          // Redux update
          dispatch(removeUser(currentProfile._id));

          // Fetch new if list khatam hone wali hai
          if (users.length <= 1 && hasMore && !loading) {
            dispatch(fetchFeed());
          }

          // Notification
          showNotification(
            `❤️ You liked ${
              currentProfile.firstName + currentProfile.lastName
            }!`
          );
        } else
          showNotification(
            `⚠️ Something went wrong
            }!`
          );
      } catch (err) {
        showNotification("⚠️ Failed to like profile");
      } finally {
        setIsLiking(false);
      }
    } else {
      setIsPassing(true);
      try {
        const res = await axios.post(
          apiUrl + `/request/send/ignored/${currentProfile._id}`,
          {},
          {
            withCredentials: true,
          }
        );
        if (res.status == 200) {
          dispatch(removeUser(currentProfile._id));

          if (users.length <= 1 && hasMore && !loading) {
            dispatch(fetchFeed());
          }

          showNotification(
            `❌ You passed on ${
              currentProfile.firstName + currentProfile.lastName
            }`
          );
        } else showNotification("⚠️ Something went wrong");
      } catch (err) {
        showNotification("⚠️ Failed to pass profile");
      } finally {
        setIsPassing(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(
        apiUrl + `/searchbyname/?name=${searchQuery}`,
        {
          withCredentials: true,
        }
      );

      // store users separately
      if (res.status == 200) setSearchResults(res.data.data);
      else return;
    } catch (err) {
    } finally {
      setTimeout(() => setIsSearching(false), 800);
    }
  };

  return (
    <div>
      {selectedUser ? (
        selectedUser === userId ? (
          <MyProfile onBack={() => setSelectedUser(null)} />
        ) : (
          <UserProfile
            userId={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        )
      ) : (
        <div className="h-full flex flex-col p-3 sm:p-4">
          {/* Header */}
          <header className="flex items-center justify-center mb-4 sm:mb-6 flex-shrink-0 px-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Heart
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                  fill="currentColor"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                LoviNova
              </h1>
            </div>
          </header>
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6 flex-shrink-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full h-10 sm:h-12 pl-9 sm:pl-10 pr-20 sm:pr-24 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-400 transition-shadow text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-20 sm:right-24 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm font-semibold h-8 sm:h-9"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Search info */}
          {searchQuery && (
            <div className="mb-4 text-center flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-600">
                {searchResults.length > 0
                  ? `Found ${searchResults.length} profile${
                      searchResults.length === 1 ? "" : "s"
                    }`
                  : `No profiles found for "${searchQuery}"`}
              </p>
            </div>
          )}

          {/* Card */}
          <main className="flex-1 flex items-center justify-center relative min-h-[70vh] px-2">
            {searchResults.length > 0 ? (
              <div className="max-w-full sm:max-w-md w-full mx-auto">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">
                  Search Results
                </h2>
                <ul className="space-y-2 sm:space-y-3">
                  {searchResults.map((profile) => (
                    <li
                      key={profile._id}
                      className="flex items-center p-2 sm:p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(profile._id)}
                    >
                      <ImageWithFallback
                        src={profile.profilePicture?.url}
                        alt={profile.firstName + profile.lastName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-2 sm:mr-3"
                      />
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {profile.location}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : currentProfile ? (
              <div className="relative max-w-full sm:max-w-sm w-full self-center">
                {/* stacked cards */}
                {filteredProfiles.slice(1, 3).map((profile, i) => (
                  <div
                    key={profile._id}
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg transition-all duration-300 h-[85%] sm:h-[90%]"
                    style={{
                      transform: `scale(${1 - (i + 1) * 0.04}) translateY(${
                        (i + 1) * 10
                      }px)`,
                      zIndex: 20 - i,
                      opacity: 1 - (i + 1) * 0.2,
                    }}
                  />
                ))}
                <div className="relative z-30 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                  <div className="relative h-56 sm:h-3/5">
                    <ImageWithFallback
                      src={currentProfile.profilePicture.url}
                      alt={currentProfile.firstName + currentProfile.lastName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                      <h2 className="text-xl sm:text-3xl font-bold drop-shadow-lg">
                        {currentProfile.firstName + currentProfile.lastName},{" "}
                        {currentProfile.age}
                      </h2>
                      <div className="flex items-center mt-1 text-xs sm:text-sm opacity-90">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        {currentProfile.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-3 sm:p-4">
                    <p className="text-gray-700 font-serif text-sm sm:text-base line-clamp-2">
                      {currentProfile.bio}
                    </p>
                  </div>

                  <div className="flex justify-center items-center space-x-6 sm:space-x-8 py-2">
                    <button
                      onClick={() => handleSwipe("pass")}
                      disabled={isLiking || isPassing}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:scale-110 transition-transform active:scale-95 shadow-lg disabled:opacity-50"
                    >
                      {isPassing ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X
                          className="w-7 h-7 sm:w-8 sm:h-8 text-red-500"
                          strokeWidth={3}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => handleSwipe("like")}
                      disabled={isLiking || isPassing}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 active:scale-95 shadow-xl disabled:opacity-50"
                    >
                      {isLiking ? (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart
                          className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                          fill="currentColor"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-gray-500">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  {loading ? "Loading Profiles..." : "No More Profiles"}
                </h3>
                <p className="text-sm sm:text-base">
                  {loading
                    ? "Fetching new matches..."
                    : error
                    ? `Error: ${error}`
                    : "Check back later for new matches!"}
                </p>
              </div>
            )}
          </main>

          {/* Toast */}
          <div
            className={`absolute top-5 left-1/2 -translate-x-1/2 transition-all duration-300 ${
              notification.show
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-10"
            }`}
          >
            <div className="flex items-center bg-green-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <p>{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedSection;
