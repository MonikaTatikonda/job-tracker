const express = require("express");
const router = express.Router();
const fs = require("fs");
const authMiddleware = require("../services/authMiddleware");

const FILE = "./data/recent.json";

// Read data
const getRecent = () => {
  return JSON.parse(fs.readFileSync(FILE));
};

// Save data
const saveRecent = (data) => {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};


// ✅ ADD RECENT JOB (when user views a job)
router.post("/", authMiddleware, (req, res) => {
  const { jobId, title, company } = req.body;
  const userId = req.user.id;

  let data = getRecent();

  // Remove duplicate if already exists
  data = data.filter(item => !(item.userId === userId && item.jobId === jobId));

  // Add new at top
  data.unshift({
    userId,
    jobId,
    title,
    company,
    viewedAt: new Date()
  });

  // Keep only last 5 items
  data = data.slice(0, 5);

  saveRecent(data);

  res.json({ message: "Added to recent" });
});


// ✅ GET RECENT JOBS
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;
  let data = getRecent();

  const userRecent = data.filter(item => item.userId === userId);

  res.json(userRecent);
});

module.exports = router;
