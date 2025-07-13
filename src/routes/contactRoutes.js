const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/', contactController.submitContact);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions (Admin only)
 * @access  Private (Admin)
 */
router.get('/', contactController.getAllContacts);

/**
 * @route   GET /api/contact/:id
 * @desc    Get contact submission by ID (Admin only)
 * @access  Private (Admin)
 */
router.get('/:id', contactController.getContactById);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete contact submission (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', contactController.deleteContact);

module.exports = router; 