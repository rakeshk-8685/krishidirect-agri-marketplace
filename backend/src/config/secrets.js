/**
 * secrets.js — Centralized secrets & security config
 * Fails fast if required environment variables are missing.
 */

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
};

const JWT_SECRET = process.env.NODE_ENV === 'production'
  ? getRequiredEnv('JWT_SECRET')
  : (process.env.JWT_SECRET || 'dev_only_jwt_secret_not_for_production');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
