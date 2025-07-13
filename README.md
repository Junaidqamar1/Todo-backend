# 🧠 Real-Time Collaborative Task Board

A real-time collaborative task management app built with React, Node.js, Socket.IO, and MongoDB. It allows multiple users to create, assign, and update tasks live, with conflict detection and smart auto-assignment features.

---

## 🌐 Live Demo

- 🔗 **Frontend (Netlify)**: [View Live Site](https://todo-webalar.netlify.app/)
- 🔗 **Backend API (Railway)**: [API Base URL](https://todo-backend-production-6db3.up.railway.app/api)
- 🎥 **Demo Video**: [Watch Here](https://drive.google.com/file/d/1CE9pxNiqwrxzwaol1hPDxd0_R-e9hVmP/view?usp=sharing)

---

## 🧰 Tech Stack

- **Frontend**: React.js, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.IO
- **Database**: MongoDB Atlas
- **Hosting**: Netlify (Frontend), Railway (Backend)
- **Real-time Communication**: WebSockets via Socket.IO

---

## 📦 Features

- 🧑‍💼 User Registration & Login
- 📝 Create, Update, Delete tasks
- 🔄 Real-time syncing of tasks across all users
- ⚔️ Conflict Detection & Resolution
- 🧠 Smart Auto Assignment (assigns task to user with least workload)
- 📜 Activity Log for tracking actions
- 📤 Drag & Drop task status (Todo, In Progress, Done)
- ✅ Fully responsive design

---

## 🧠 Smart Assign (Key Feature)

When you click **"🧠 Smart Assign"**, the system:

1. Fetches all users
2. Counts how many tasks each user currently has
3. Assigns the task to the user with the **least workload**
4. Updates the task in the DB and syncs changes in real time

🔁 This helps distribute tasks fairly and automatically.

---

## ⚔️ Conflict Handling (Key Feature)

When two users update the **same task at the same time**, we:

1. Store a `lastModified` timestamp in each task
2. When a task is updated, compare timestamps
3. If conflict detected:
   - Respond with HTTP `409 Conflict`
   - Return both `currentTask` and `attemptedUpdate`
4. Prompt user: "Overwrite or Cancel?"

✅ Ensures **no data loss or overwrites**.

---

## 🔄 Real-Time Collaboration

All updates are broadcast with Socket.IO events:

- `task-created`
- `task-updated`
- `task-deleted`
- `new-action` (for activity log)

🚀 Users see changes instantly without refreshing.

---

## 🚀 Setup and Installation

### 🔧 Backend (Node + Express)

```bash
git clone https://github.com/junaid1/repo.git
cd server
npm install
npm start
