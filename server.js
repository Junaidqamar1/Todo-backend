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

const corsOptions = {
  origin: "https://todo-webalar.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


const io = socketIO(server, {
  cors: corsOptions,
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

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
