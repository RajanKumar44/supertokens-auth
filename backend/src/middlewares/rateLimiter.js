const rateLimit = require("express-rate-limit");

/**
 * Rate Limiter for Email Verification
 * Limits to 10 requests per 15 minutes per IP.
 * After exceeding, user gets a timeout message.
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many verification requests",
    message:
      "You have exceeded the limit of 10 email verification attempts. Please wait 15 minutes before trying again.",
    retryAfterMinutes: 15,
  },
  handler: (req, res, next, options) => {
    console.log(
      `⚠️  Rate limit exceeded for email verification from IP: ${req.ip}`
    );
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter for Signup
 * Limits to 10 signups per 15 minutes per IP.
 */
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many signup attempts",
    message:
      "You have exceeded the limit of 10 signup attempts. Please wait 15 minutes before trying again.",
    retryAfterMinutes: 15,
  },
  handler: (req, res, next, options) => {
    console.log(`⚠️  Rate limit exceeded for signup from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter for Login
 * Limits to 10 login attempts per 15 minutes per IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many login attempts",
    message:
      "You have exceeded the limit of 10 login attempts. Please wait 15 minutes before trying again.",
    retryAfterMinutes: 15,
  },
  handler: (req, res, next, options) => {
    console.log(`⚠️  Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter for Password Reset
 * Limits to 5 reset requests per 15 minutes per IP.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many password reset attempts",
    message:
      "You have exceeded the limit of 5 password reset attempts. Please wait 15 minutes before trying again.",
    retryAfterMinutes: 15,
  },
  handler: (req, res, next, options) => {
    console.log(
      `⚠️  Rate limit exceeded for password reset from IP: ${req.ip}`
    );
    res.status(429).json(options.message);
  },
});

module.exports = {
  emailVerificationLimiter,
  signupLimiter,
  loginLimiter,
  passwordResetLimiter,
};
