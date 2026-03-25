const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../services/authMiddleware");

// ✅ Use absolute path (IMPORTANT for Render)
const FILE = path.join(__dirname, "../data/recent.json");

// ✅ Ensure file exists
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify([]));
}

// Read data safely
const getRecent = () => {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
};

// Save data safely
const saveRecent = (data) => {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};


// ✅ ADD RECENT JOB
router.post("/", authMiddleware, (req, res) => {
  try {
    const { jobId, title, company } = req.body;
    const userId = req.user.id;

    let data = getRecent();

    // Remove duplicate for same user
    data = data.filter(
      item => !(item.userId === userId && item.jobId === jobId)
    );

    // Add new job
    data.unshift({
      userId,
      jobId,
      title,
      company,
      viewedAt: new Date()
    });

    // ✅ Keep only last 5 per user (FIXED)
    const userItems = data.filter(item => item.userId === userId).slice(0, 5);
    const otherItems = data.filter(item => item.userId !== userId);

    data = [...userItems, ...otherItems];

    saveRecent(data);

    res.json({ message: "Added to recent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET RECENT JOBS
router.get("/", authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    let data = getRecent();

    const userRecent = data
      .filter(item => item.userId === userId)
      .slice(0, 5); // extra safety

    res.json(userRecent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
