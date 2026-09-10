const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');

const router = express.Router();

// PUBLIC — guest applies with CV + details, no login required
router.post('/:jobId', upload.single('cv'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { fullName, email, phone, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'CV file is required (pdf/doc/docx)' });
    }

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'fullName, email, and phone are required' });
    }

    // Upload the buffer straight to Cloudinary — no local disk involved
    const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);

    const application = await Application.create({
      job: jobId,
      fullName,
      email,
      phone,
      coverLetter,
      cvFile: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        originalName: req.file.originalname,
      },
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: all applications
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title company location')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: applications for one job
router.get('/job/:jobId', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get the CV — just returns the Cloudinary URL, frontend opens/downloads it directly
router.get('/:id/cv', protect, adminOnly, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    res.json({
      url: application.cvFile.url,
      originalName: application.cvFile.originalName,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update application status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = status || application.status;
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;