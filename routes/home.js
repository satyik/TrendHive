const express = require('express');
const router = express.Router();

const { getHome, submitContactForm } = require('../controllers/homeControllers');

// React API endpoints
router.get('/api/home', getHome);
router.post('/api/contact', submitContactForm);

module.exports = router;
