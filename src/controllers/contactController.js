const Contact = require('../models/Contact');
const { sendEmail } = require('../config/nodemailer');

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message'
      });
    }

    // Create contact submission
    const contact = await Contact.create({
      name: name || 'Anonymous',
      email,
      subject: subject || 'General Inquiry',
      message
    });

    // Send notification emails
    try {
      await sendEmail({
        email: contact.email,
        subject: 'Thank you for contacting us',
        message: `Dear ${contact.name},\n\nThank you for reaching out to us. We have received your message and will get back to you soon.\n\nBest regards,\nTrendHive Team`
      });

      await sendEmail({
        email: process.env.ADMIN_EMAIL || 'admin@trendhive.com',
        subject: 'New Contact Form Submission',
        message: `New contact form submission:\n\nName: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject}\nMessage: ${contact.message}`
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully. We will get back to you soon.',
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          submittedAt: contact.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form. Please try again.'
    });
  }
};

/**
 * @desc    Get all contact submissions (Admin only)
 * @route   GET /api/contact
 * @access  Private (Admin)
 */
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: {
        contacts,
        count: contacts.length
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submissions'
    });
  }
};

/**
 * @desc    Get contact submission by ID (Admin only)
 * @route   GET /api/contact/:id
 * @access  Private (Admin)
 */
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact submission'
    });
  }
};

/**
 * @desc    Delete contact submission (Admin only)
 * @route   DELETE /api/contact/:id
 * @access  Private (Admin)
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact submission'
    });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  deleteContact
}; 