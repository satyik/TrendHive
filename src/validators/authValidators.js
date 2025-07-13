const Joi = require('joi');

const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
      }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required()
      .messages({
        'string.pattern.base': 'Please provide a valid 10-digit phone number',
        'string.empty': 'Phone number is required'
      })
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Password is required'
      })
  });

  return schema.validate(data);
};

const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional()
      .messages({
        'string.pattern.base': 'Please provide a valid 10-digit phone number'
      }),
    username: Joi.string().alphanum().min(3).max(30).optional()
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      })
  });

  return schema.validate(data);
};

const validatePasswordReset = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Please confirm your password'
      })
  });

  return schema.validate(data);
};

const validateOnboarding = (data) => {
  const schema = Joi.object({
    color: Joi.array().items(Joi.string()).min(1).max(5).required()
      .messages({
        'array.min': 'Please select at least one color',
        'array.max': 'You can select up to 5 colors'
      }),
    favCeleb: Joi.array().items(Joi.string()).min(1).max(5).required()
      .messages({
        'array.min': 'Please select at least one celebrity',
        'array.max': 'You can select up to 5 celebrities'
      })
  });

  return schema.validate(data);
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordReset,
  validateOnboarding
}; 