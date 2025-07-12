const Task = require("../models/Task");
const Action = require("../models/Action");
const User = require("../models/User"); // Ensure this is imported

// CREATE Task
const createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    // 🔍 Get user info for logging
    const user = await User.findById(req.body.assignedTo);

    // ✅ Populate assigned user for frontend
    const populatedTask = await task.populate("assignedTo", "username email");

    // 📝 Log the action
    const action = await Action.create({
      user: req.body.assignedTo,
      task: task._id,
      actionType: "create",
      message: `${user.username} created task "${task.title}"`,
    });

    const io = req.app.get("io");

    // ✅ Emit fully populated task
    io.emit("task-created", populatedTask);
    io.emit("new-action", action);

    res.status(201).json(populatedTask);
  } catch (err) {
    console.error("Task creation failed", err);
    res.status(400).json({ message: "Task creation failed", error: err.message });
  }
};


// GET All Tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "username email");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
};

// UPDATE Task
const updateTask = async (req, res) => {
  try {
    const clientTime = new Date(req.body.lastModified);
    const taskInDb = await Task.findById(req.params.id).populate("assignedTo");

    if (!taskInDb) return res.status(404).json({ message: "Task not found" });

    const dbTime = new Date(taskInDb.lastModified);
    if (dbTime > clientTime) {
      return res.status(409).json({
        message: "Conflict detected",
        currentTask: taskInDb,
        attemptedUpdate: req.body,
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModified: Date.now() },
      { new: true }
    ).populate("assignedTo");

    const io = req.app.get("io");
    io.emit("task-updated", updatedTask);

    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: "Task update failed", error: err.message });
  }
};



// DELETE Task
const deleteTask = async (req, res) => {
  try {
    console.log("hitted");

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(task.assignedTo);

    const action = await Action.create({
      user: task.assignedTo,
      task: task._id,
      actionType: "delete",
      message: `${user?.username || "Someone"} deleted task "${task.title}"`,
    });

    const io = req.app.get("io");
    io.emit("task-deleted", task._id);
    io.emit("new-action", action);

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Task deletion failed", error: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
