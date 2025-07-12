const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

const User = require("../models/User"); 


router.post("/register", register);
router.post("/login", login);


router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}, "username email _id"); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


module.exports = router;
