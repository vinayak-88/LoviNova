# 💖 Lovinova – Full-Stack Social Connection Platform  

🚀 **Lovinova** is a MERN stack social connection and dating app featuring secure authentication, AI-powered profile validation, real-time chat, and an engaging swipe-style discovery feed.  

---

## ✨ Features  

- 🔐 **Secure Authentication** – JWT-based login with httpOnly cookies, OTP verification, password reset flow  
- 💬 **Real-Time Chat** – Socket.IO messaging with online presence, read receipts, and instant delivery  
- 🤖 **AI-Powered Validation** – Google Cloud Vision API ensures uploaded profile images contain a valid human face  
- ☁️ **Cloud Media Pipeline** – Cloudinary integration for image storage, optimization, and delivery  
- ❤️ **User Discovery** – Swipe-style feed, search, requests, matches, blocking/unblocking  
- ⚡ **Optimized Backend** – MongoDB with Mongoose transactions & indexing for high-performance queries  

---

## 🛠 Tech Stack  

| Category        | Technologies |  
|-----------------|--------------|  
| **Frontend**    | React, React Router, Redux Toolkit, Tailwind CSS, React Hook Form |  
| **Backend**     | Node.js, Express.js |  
| **Database**    | MongoDB, Mongoose |  
| **Real-Time**   | Socket.IO |  
| **Auth & Security** | JWT, bcrypt, rate limiting |  
| **Cloud & APIs** | Cloudinary, Google Cloud Vision, Google Maps |  
| **Emailing**    | Brevo(SendInBlue) |  

---

## Few Screenshots

<img width="1898" height="906" alt="Screenshot 2025-10-09 222334" src="https://github.com/user-attachments/assets/ccfea2d8-f745-4ad5-8b76-b66064adf09a" />

<img width="1529" height="817" alt="Screenshot 2025-10-09 220307" src="https://github.com/user-attachments/assets/b5f245c6-3d44-43d9-9a37-ea5e9d5e6b03" />

<img width="1887" height="911" alt="Screenshot 2025-10-09 214854" src="https://github.com/user-attachments/assets/049a0874-4844-4a60-9c83-76006c13108f" />

<img width="1919" height="908" alt="Screenshot 2025-10-09 211403" src="https://github.com/user-attachments/assets/905dee66-1a74-4f0c-bc81-2aa4f212cd0e" />

<img width="1919" height="907" alt="Screenshot 2025-10-09 211920" src="https://github.com/user-attachments/assets/f281ac01-3d1a-44ea-bb47-2c0f27beac7f" />

<img width="1905" height="913" alt="Screenshot 2025-10-09 230013" src="https://github.com/user-attachments/assets/54186dd2-d5c1-4fdf-8f14-285260ec42a4" />

<img width="1883" height="905" alt="Screenshot 2025-10-09 214941" src="https://github.com/user-attachments/assets/7bd6a4f5-0487-413c-8469-f19f00a47556" />

<img width="1901" height="907" alt="Screenshot 2025-10-09 214752" src="https://github.com/user-attachments/assets/097ddc1a-8a28-4a3f-b3a6-c9e5df2a367f" />

---

## 📁 Project Structure

```
LoviNova/
├── Backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── config/                # Database, email, Vision API configs
│   │   ├── middlewares/           # Auth, upload middlewares
│   │   ├── models/                # MongoDB schemas (User, Chat, Message, etc.)
│   │   ├── routes/                # API routes (auth, chat, profile, requests)
│   │   ├── utils/                 # Helper utilities (validation, OTP, Cloudinary, Vision)
│   │   └── uploads/               # Temporary file storage
│   ├── package.json
│   └── README.md
├── Frontend/
│   ├── src/
│   │   ├── components/            # React components (ChatSection, Feed, Profile, etc.)
│   │   ├── utils/                 # Redux slices, auth routes, helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── nginx.conf
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ and **npm** or **yarn**
- **MongoDB** instance (local or cloud via MongoDB Atlas)
- **Git** for version control
- **Parcel** as a bundler

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `Backend/` directory with:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GOOGLE_VISION_API_KEY=your_google_vision_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_app_password
   FRONTEND_URL=http://localhost:1234
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Update `apiUrl` in your frontend components to point to `http://localhost:3000`

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:1234`

---

## 🔑 Key Features Explained

### 🔐 Authentication Flow
- User signs up with email and password
- OTP verification sent via email
- JWT token stored in httpOnly cookies for security
- Password reset with secure token-based flow

### 💬 Real-Time Chat
- Socket.IO enables instant message delivery
- Online presence indicator
- Read receipts for message confirmation
- Chat history persisted in MongoDB

### 🤖 AI-Powered Profile Validation
- Google Cloud Vision API validates profile images
- Ensures only images with valid human faces are accepted
- Prevents spam and fake profiles

### ☁️ Cloud Media Management
- Cloudinary integration for image storage
- Automatic image optimization and resizing
- CDN delivery for faster load times

### ❤️ User Discovery & Interactions
- **Feed** – Discover users according to your preferences
- **Search** – Find users by name
- **Connection Requests** – Send and manage requests
- **Matches** – View mutual matches
- **Blocking** – Block/unblock users for privacy control

---

## 📚 API Documentation

### Authentication
- `POST /auth/check-auth` - Checks if user is logged In
- `POST /auth/signup` – Register new user
- `POST /auth/login` – Login with email & password
- `POST /auth/verify-otp` – Verify email OTP
- `POST /auth/forgot-password` – Initiate password reset
- `POST /auth/forgotpassword/verifyotp` - Verify email OTP for password change
- `POST /auth/reset-password` – Reset password with token
- `POST /auth/resend-otp` - Resend OTP to user email
- `POST /auth/logout` - Logout User

### User Profile
- `GET /profile` – Fetch logged-in user profile
- `PATCH /profile` – Update profile information
- `PATCH /profile/changepassword` - Change password feature from profile page
- `GET /profile/user/view/:userId` - View user profile
- `POST /profile/upload` - Upload/Change profile picture with AI validation
- `GET /profile/searchbyname` - Search users by their name

### Chat & Messages
- `GET /chats` – Fetch all user chats
- `GET /chat/:conversationId` – Fetch all messages of a chat
- `POST /messages` – Send a message (via Socket.IO)

### Match Requests
- `POST /request/send/:status/:userId` - Send connection request
- `PATCH /request/review/:status/:requestId` - Accept or reject connection request

### User Discovery
- `GET /feed` – Get swipe feed
- `GET /user/requests/received` – Fetch received requests
- `GET /user/connections` - Fetch all connections of LoggedIn user
- `DELETE /user/connections/removeconnection/:userId` - Remove a connection
- `POST /block` - Block user
- `POST /unblock` - Unblock user
- `GET /blocklist/view` - Get all Blocked users

---

## 🛠 Troubleshooting

### Common Issues

**Chats not loading?**
- Check that `apiUrl` points to correct backend URL
- Verify backend is running (`npm start` in Backend/)
- Check browser console for fetch errors

**Profile image upload fails?**
- Ensure Google Cloud Vision API key is valid
- Verify Cloudinary credentials are set in `.env`
- Image must contain a valid human face

**Real-time chat not working?**
- Confirm Socket.IO is running on backend
- Check WebSocket connection in browser DevTools
- Verify frontend and backend URLs match

**Database connection error?**
- Verify MongoDB URI in `.env`
- Ensure MongoDB service is running
- For Atlas, check IP whitelist allows your connection

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/your-feature`
3. **Commit changes:** `git commit -m "Add your feature"`
4. **Push to branch:** `git push origin feature/your-feature`
5. **Open a Pull Request** with description of changes

---

## 💬 Support

For issues, feature requests, or questions:
- Open an [Issue](https://github.com/vinayak-88/LoviNova/issues) on GitHub
- Contact the maintainer: vinayak-88

---

**Made with ❤️ by the Vinayak Goel**
