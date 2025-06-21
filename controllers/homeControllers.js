const jwt = require('jsonwebtoken');
const Contact = require('../src/models/Contact');
const User = require('../src/models/User');
const { contactMail } = require('../config/nodemailer');

// GET /api/home
const getHome = async (req, res) => {
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

  return res.json({
    loggedIn: !!user,
    user: user ? { name: user.name, profilePic: user.profilePic } : null,
  });
};

// POST /api/contact
const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ error: 'Please provide a valid email' });
  }

  try {
    const newIssue = await Contact.create({ name, email, subject, message });

    // Send emails
    contactMail(newIssue, 'user');
    contactMail(newIssue, 'admin');

    return res.status(201).json({ message: 'Issue submitted successfully' });
  } catch (err) {
    console.error('Contact submission error:', err.message);
    return res.status(500).json({ error: 'Failed to submit issue' });
  }
};

module.exports = {
  getHome,
  submitContactForm,
};
