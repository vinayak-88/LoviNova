import { useState, useEffect, useRef } from "react";
import {
  Lock,
  Edit,
  X,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  ArrowLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import axios from "axios";
import { updateUser } from "../utils/userSlice";
import ImageWithFallback from "../utils/ImageWithFallBack";

// --- Main Application Component ---
export default function MyProfile({ onBack }) {
  const user = useSelector((state) => state.user.user);
  const [userProfile, setUserProfile] = useState(user);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modal, setModal] = useState(null); // 'profile', 'password', or 'picture'
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const apiUrl = process.env.API_URL;

  // --- Effects ---
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(
        () => setNotification({ show: false, message: "" }),
        2500
      );
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Event Handlers ---
  const openEditProfileModal = () => {
    setEditedProfile({ ...userProfile });
    setModal("profile");
  };

  const openChangePictureModal = () => {
    setEditedProfile({ ...userProfile });
    setModal("picture");
  };

  const openEditPasswordModal = () => {
    setModal("password");
  };

  useEffect(() => {
    setUserProfile(user);
  }, [user]);

  const handleProfileChange = async (data) => {
    try {
      const res = await axios.patch(
        apiUrl + `/profile/edit`,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          age: parseInt(data.age),
          gender: data.gender,
          lookingFor: data.lookingFor,
          bio: data.bio,
          location: data.location,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        dispatch(updateUser(data));
        setModal(null);
        setNotification({
          show: true,
          message: "Profile updated successfully!",
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Something went wrong",
      });
    }
    // const { name, value } = e.target;
    // setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Update local state for preview
      setEditedProfile((prev) => ({
        ...prev,
        profilePicture: {
          ...prev.profilePicture,
          url: URL.createObjectURL(file), // browser-generated preview URL
          publicId: null,
          isVerified: false, // no Cloudinary id yet
        },
      }));
    }
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handlePasswordChange = async (data) => {
    try {
      const res = await axios.patch(
        apiUrl + `/profile/passwordchange`,
        {
          emailId: user.emailId,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setModal(null);
        setNotification({
          show: true,
          message: "Password updated successfully!",
        });
      } else
        setNotification({
          show: true,
          message: "Please enter correct current password",
        });
    } catch (error) {
      setNotification({ show: true, message: "Error changing password" });
    } finally {
      reset();
    }
  };

  const savePicture = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("profilepic", selectedFile);

    try {
      const res = await axios.post(apiUrl + `/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.status === 200) {
        const { url, public_id } = res.data;
        dispatch(
          updateUser({
            profilePicture: { url, publicId: public_id, isVerified: true },
          })
        );

        setUserProfile((prev) => ({
          ...prev,
          profilePicture: { url, publicId: public_id, isVerified: true },
        }));
        setLoading(false)
        setModal(null);
        setNotification({ show: true, message: "Profile picture updated!" });
      }
    } catch (err) {
      setLoading(false)
      setNotification({ show: true, message: "Failed to upload picture" });
    }
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  );

  // --- Render ---
  return (
    <div className="w-full bg-gray-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 py-3 px-3 sm:px-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto h-full flex flex-col">
        <h1 className="text-2xl sm:text-3xl md:text-4xl my-6 font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
          View Profile
        </h1>

        <main className="flex-1 pb-4 px-3 sm:px-4 md:px-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <ImageWithFallback
                  src={userProfile.profilePicture.url}
                  alt={userProfile.firstName + " " + userProfile.lastName}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <DetailItem label="First Name" value={userProfile.firstName} />
                <DetailItem label="Last Name" value={userProfile.lastName} />
                <DetailItem label="Age" value={userProfile.age} />
                <DetailItem label="Gender" value={userProfile.gender} />
              </div>
              <DetailItem label="Looking For" value={userProfile.lookingFor} />
              <DetailItem label="Email" value={userProfile.emailId} />
              <DetailItem label="Password" value="••••••••" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Bio</p>
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                  {userProfile.bio}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={openChangePictureModal}
                className="flex items-center justify-center h-11 px-4 sm:px-6 text-sm sm:text-base text-pink-600 font-semibold rounded-full bg-pink-100 hover:bg-pink-200 transition-all duration-200"
              >
                <Camera className="w-4 h-4 mr-2" />
                Picture
              </button>
              <button
                onClick={openEditProfileModal}
                className="flex items-center justify-center h-11 px-4 sm:px-6 text-sm sm:text-base text-white font-semibold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={openEditPasswordModal}
                className="flex items-center justify-center h-11 px-4 sm:px-6 text-sm sm:text-base text-pink-600 font-semibold rounded-full bg-pink-100 hover:bg-pink-200 transition-all duration-200"
              >
                <Lock className="w-4 h-4 mr-2" />
                Password
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {modal === "profile" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit(handleProfileChange)}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Details
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <input
                  name="firstName"
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-pink-400 focus:border-transparent"
                  {...register("firstName", {
                    required: "Firstname is required",
                  })}
                />
                {errors.firstname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="lastName"
                  id="lastName"
                  placeholder="Last Name"
                  type="text"
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-pink-400 focus:border-transparent"
                  {...register("lastName", {
                    required: "Lastname is required",
                  })}
                />
                {errors.lastname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="age"
                  id="age"
                  placeholder="Age"
                  type="number"
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-pink-400 focus:border-transparent"
                  {...register("age", {
                    required: "Age is required",
                    min: { value: 18, message: "You must be at least 18" },
                  })}
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  name="gender"
                  id="gender"
                  {...register("gender", {
                    required: "Please select a gender",
                  })}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-white focus:ring-pink-400 focus:border-transparent"
                >
                  <option value="" disabled>
                    Select your gender
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
              <div>
                <select
                  name="lookingFor"
                  id="lookingFor"
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-white focus:ring-pink-400 focus:border-transparent"
                  {...register("lookingFor", {
                    required: "Please make a selection",
                  })}
                >
                  <option value="" disabled>
                    Who are you looking for
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
              <div>
                <input
                  name="location"
                  id="location"
                  type="text"
                  placeholder="City Name"
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-pink-400 focus:border-transparent"
                  {...register("location", {
                    required: "City name is required",
                  })}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
              <textarea
                name="bio"
                id="bio"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-pink-400 focus:border-transparent"
                placeholder="Bio"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 h-11 text-white font-semibold rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Change Picture Modal */}
      {modal === "picture" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            encType="multipart/form-data"
            onSubmit={(e) => {
              //no handle submit as file isn't registered with rhf
              e.preventDefault();
              savePicture();
            }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Change Picture
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <ImageWithFallback
                src={editedProfile?.profilePicture?.url}
                alt="Avatar preview"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full h-11 flex items-center justify-center text-sm font-semibold rounded-full bg-gray-100 hover:bg-gray-200"
              >
                Upload New Picture
              </button>
              <input
                name="profilepic"
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 h-11 text-white font-semibold rounded-full 
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-pink-500 to-purple-600"
    }
  `}
            >
              {loading ? "Uploading..." : "Save Picture"}
            </button>
          </form>
        </div>
      )}

      {/* Edit Password Modal */}
      {modal === "password" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit(handlePasswordChange)}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                name="current"
                id="currentPassword"
                placeholder="Current Password"
                type="password"
                className="w-full h-11 px-4 border border-gray-300 rounded-lg"
                {...register("currentPassword", {
                  required: "Current Password is required",
                })}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
              <div className="relative">
                <input
                  name="new"
                  placeholder="New Password"
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg"
                  {...register("newPassword", {
                    required: "Current Password is required",
                  })}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-4 h-11 text-white font-semibold rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Notification Toast */}
      <div
        className={`fixed z-50 top-4 sm:top-5 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out px-2 sm:px-0 ${
          notification.show
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10"
        }`}
      >
        <div className="flex items-center bg-green-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg max-w-[90vw] sm:max-w-md truncate">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <p>{notification.message}</p>
        </div>
      </div>
    </div>
  );
}
