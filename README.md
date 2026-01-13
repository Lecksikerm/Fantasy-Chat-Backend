#  Fantasy Chat API — Real‑Time Chat Application Backend

A fully featured, production‑grade chat backend built with **Node.js**, **Express**, **Socket.IO**, **MongoDB**, and **Redis**.
Supports real‑time messaging, media uploads, voice notes, seen receipts, typing indicators, online presence, and more.

---

##  Tech Stack

* **Node.js + Express** — REST API
* **MongoDB + Mongoose** — database
* **Socket.IO** — real‑time messaging
* **Redis** — online presence + caching
* **JWT Authentication** — access/refresh tokens
* **Multer** — file handling
* **Cloudinary** — media storage (images, files, audio)

---

##  Features

###  Authentication

* User signup & login
* Email OTP verification
* Refresh token rotation
* Route protection middleware

###  Messaging System

* Real‑time text messages
* Image/file uploading
* Voice notes recording & playback
* Seen receipts (`mark-seen`)
* Delivered timestamps
* Unread message counting
* Conversation rooms

###  Realtime Events

| Event               | Description                               |
| ------------------- | ----------------------------------------- |
| `send-message`      | Send a new message                        |
| `new-message`       | Broadcast message to conversation members |
| `typing`            | User started typing                       |
| `user-typing`       | Notify others in room                     |
| `stop-typing`       | User stopped typing                       |
| `join-conversation` | Join conversation room                    |
| `mark-seen`         | Mark messages as seen                     |
| `messages-seen`     | Broadcast seen event                      |
| `user-online`       | Announce user online                      |
| `user-offline`      | Announce user offline                     |
| `get-unread-count`  | Request unread count                      |
| `unread-count`      | Response unread count                     |

---

##  Project Structure

```
src/
 ├── config/
 │    ├── db.ts
 │    └── redis.ts
 ├── models/
 │    ├── user.model.ts
 │    ├── conversation.model.ts
 │    └── message.model.ts
 ├── modules/
 │    ├── auth/
 │    └── chat/
 ├── routes/
 │    └── upload.routes.ts
 ├── socket.ts
 └── server.ts
```

---

## 🔌 Socket.IO Flow

### User joins conversation

```js
socket.emit("join-conversation", conversationId);
```

### Send text message

```js
socket.emit("send-message", { conversationId, text });
```

### Typing indicator

```js
socket.emit("typing", { conversationId });
```

### Mark as seen

```js
socket.emit("mark-seen", { conversationId });
```

---

##  File Uploading (Images, Files, Voice Notes)

Upload endpoint:

```
POST /upload
Authorization: Bearer <token>
FormData: file
```

Backend handles via **Multer → Cloudinary** pipeline.

Returned payload:

```json
{
  "url": "https://res.cloudinary.com/...",
  "type": "audio" | "image" | "file"
}
```

Send as message attachment:

```js
socket.emit("send-message", {
  conversationId,
  attachments: [{ url, type }]
});
```

---

##  Installation & Setup

### 1️⃣ Clone project

```
git clone <repo-url>
cd fantasy-chat-backend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Configure environment

Create `.env`:

```
MONGO_URI=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
REDIS_URL=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4️⃣ Start development server

```
npm run dev
```

---

##  Authentication Routes

| Method | Route                 | Description         |
| ------ | --------------------- | ------------------- |
| POST   | `/auth/register`      | Register user       |
| POST   | `/auth/verify-otp`    | Verify email OTP    |
| POST   | `/auth/login`         | Login user          |
| POST   | `/auth/refresh-token` | Rotate access token |

---

##  Chat Routes

| Method | Route                            | Description        |
| ------ | -------------------------------- | ------------------ |
| POST   | `/chat/create-conversation`      | New conversation   |
| GET    | `/chat/conversations`            | List conversations |
| GET    | `/chat/messages/:conversationId` | Fetch messages     |

---

##  Voice Notes System

* Uses **MediaRecorder API** on frontend
* Uploads `.webm` audio
* Stored in Cloudinary
* Sent as message attachment `{ type: "audio" }`
* Frontend plays with HTML `<audio controls>`

---

##  Error Handling

* Global Express error middleware
* Multer file errors (max size, wrong format)
* JWT + Auth errors

---

## 🧪 Testing (Browser Testing Tools Provided)

We included an HTML tester for:

* Sending messages
* Uploading files
* Voice notes
* Seeing real‑time events

You can open **Browser A** and **Browser B** to simulate users.

---

##  Future Improvements

* Message reactions (❤️ 🔥 😮)
* Message editing
* Message deleting
* Push notifications
* Group chats
* Video messages

---

##  License

MIT License.

---

---

## Project link

https://github.com/Lecksikerm/Fantasy-Chat-Backend

---

## 👨‍💻 Author

Built by **Lecksikerm** 

