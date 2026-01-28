const mongoSanitize = require('express-mongo-sanitize');

const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} in ${req.path}`);
  },
});

module.exports = sanitizeInput;
