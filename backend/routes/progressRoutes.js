const express = require('express');
const router = express.Router();
const Progress = require("../models/Progress");

// GET progress
router.get('/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    const progress = await Progress.findOne({ userId, videoId });
    if (!progress) return res.json({ intervals: [] });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST or UPDATE progress
router.post('/', async (req, res) => {
  try {
    const { userId, videoId, intervals } = req.body;
    let existing = await Progress.findOne({ userId, videoId });

    if (existing) {
      // Merge new intervals with existing
      const merged = mergeIntervals([...existing.intervals, ...intervals]);
      existing.intervals = merged;
      await existing.save();
      return res.json(existing);
    } else {
      const newProgress = new Progress({ userId, videoId, intervals });
      await newProgress.save();
      return res.json(newProgress);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: merge overlapping intervals
const mergeIntervals = (intervals) => {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push(intervals[i]);
    }
  }
  return merged;
};

module.exports = router;
