const Joi = require("joi");

 
const options = {
  abortEarly: false,     
  allowUnknown: false,   
  stripUnknown: true,   
};

 
const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
    }),

  email: Joi.string()
    .trim()
    .email()
    .max(100)
    .required()
    .messages({
      "string.email": "Invalid email address",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.empty": "Password is required",
    }),
});

 
const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email address",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
    }),
});
 
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((err) => err.message),
    });
  }

  req.body = value; 
  next();
};

module.exports = {
  signupValidation: validate(signupSchema),
  loginValidation: validate(loginSchema),
};
