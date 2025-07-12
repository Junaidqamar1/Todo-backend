const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const socketIO = require("socket.io");
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("create-task", (task) => {
    socket.broadcast.emit("task-created", task);
  });

  socket.on("update-task", (task) => {
    socket.broadcast.emit("task-updated", task);
  });

  socket.on("delete-task", (taskId) => {
    socket.broadcast.emit("task-deleted", taskId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});



app.use(cors());
app.use(express.json());

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));



const PORT = process.env.PORT || 5000;
// const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

