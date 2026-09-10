const express = require('express');
const Subscriber = require('../models/Subscriber');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// PUBLIC — visitor clicks Subscribe
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }

    const subscriber = await Subscriber.create({ email });
    res.status(201).json({ message: 'Subscribed successfully', subscriber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: view all subscribers
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: delete a subscriber
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    await subscriber.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;