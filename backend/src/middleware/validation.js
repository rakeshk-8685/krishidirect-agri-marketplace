/**
 * Input validation middleware for KrishiDirect API
 * Validates and sanitizes user-supplied input at the route boundary.
 */

/**
 * Strip HTML-dangerous characters to prevent stored XSS.
 * NOTE: The app uses JWT-auth (not session cookies), so XSS risk is
 * limited, but defense-in-depth is applied for all string inputs.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>"'`]/g, '').trim();
};

const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Valid name (min 2 characters) is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }

  // Minimum 6 characters (matches authController and frontend validation)
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (!phone || phone.toString().trim().length < 8) {
    return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
  }

  // Sanitize string fields on the request body
  req.body.name = sanitizeString(name);
  req.body.email = email.trim().toLowerCase();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  req.body.email = email.trim().toLowerCase();
  next();
};

module.exports = { validateRegister, validateLogin, sanitizeString };
