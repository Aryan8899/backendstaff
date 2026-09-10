const express = require('express');
const Job = require('../models/Job');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Admin creates a job
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, company, location, description, requirements, salary, jobType } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements,
      salary,
      jobType,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: list active jobs (user side)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: all jobs incl inactive
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin updates job
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    Object.assign(job, req.body);
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin deletes job
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;