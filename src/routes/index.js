const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const Contact = require('../models/Contact');
const User = require('../models/User');
const { contactMail } = require('../config/nodemailer');

// -------------------------
// GET /api/home (React now renders the page)
// -------------------------
router.get('/api/home', async (req, res) => {
  const token = req.cookies.jwt;
  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).lean();
    } catch (err) {
      console.error('Invalid token:', err.message);
    }
  }

  res.json({
    loggedIn: !!user,
    user: user ? { name: user.name, profilePic: user.profilePic } : null,
  });
});

// -------------------------
// POST /api/contact
// -------------------------
router.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ error: 'Please provide a valid email' });
  }

  try {
    const newIssue = await Contact.create({ name, email, subject, message });

    contactMail(newIssue, 'user');
    contactMail(newIssue, 'admin');

    return res.status(201).json({ message: 'Issue submitted successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Failed to submit issue' });
  }
});

module.exports = router;
