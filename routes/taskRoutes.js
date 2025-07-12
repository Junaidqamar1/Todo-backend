const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const Action = require("../models/Action");

// Task Routes
router.get("/", getTasks);             // GET all tasks
router.post("/", createTask);          // CREATE a task
router.put("/:id", updateTask);        // UPDATE a task
router.delete("/:id", deleteTask);     // DELETE a task

// Activity Log Route
router.get("/actions", async (req, res) => {
  try {
    const actions = await Action.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("user", "username")
      .populate("task", "title");

    res.status(200).json(actions);
  } catch (err) {
    console.error("Error fetching actions", err.message);
    res.status(500).json({ message: "Error fetching actions", error: err.message });
  }
});


router.post("/:id/smart-assign", async (req, res) => {
  try {
    const Task = require("../models/Task");
    const User = require("../models/User");

    // Step 1: Get all users
    const users = await User.find();

    // Step 2: Count active (non-done) tasks for each user
    const counts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: "Done" },
        });
        return { user, count: taskCount };
      })
    );

    // Step 3: Find the user with the fewest tasks
    const leastBusy = counts.reduce((min, curr) =>
      curr.count < min.count ? curr : min
    );

    // Step 4: Assign the task
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: leastBusy.user._id },
      { new: true }
    ).populate("assignedTo", "username");

    // Log the action
    const Action = require("../models/Action");
    const action = await Action.create({
      user: leastBusy.user._id,
      task: task._id,
      actionType: "smart-assign",
      message: `Task "${task.title}" smart-assigned to ${leastBusy.user.username}`,
    });

    const io = req.app.get("io");
    io.emit("task-updated", task);
    io.emit("new-action", action);

    res.status(200).json(task);
  } catch (err) {
    console.error("Smart assign failed", err);
    res.status(500).json({ message: "Smart assign failed", error: err.message });
  }
});


module.exports = router;
