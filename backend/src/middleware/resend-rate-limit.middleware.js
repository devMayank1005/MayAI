const resendAttempts = new Map();

function getWindowMs() {
  if (process.env.NODE_ENV === 'production') {
    return Number(process.env.RESEND_VERIFICATION_WINDOW_MS_PROD || process.env.RESEND_VERIFICATION_WINDOW_MS || 30000);
  }

  return Number(process.env.RESEND_VERIFICATION_WINDOW_MS_DEV || process.env.RESEND_VERIFICATION_WINDOW_MS || 30000);
}

function setRateLimitHeaders(res, retryAfterSeconds, windowMs) {
  const windowSeconds = Math.ceil(windowMs / 1000);
  res.setHeader('X-RateLimit-Window-Seconds', String(windowSeconds));
  res.setHeader('X-RateLimit-Remaining', retryAfterSeconds > 0 ? '0' : '1');

  if (retryAfterSeconds > 0) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + retryAfterSeconds));
  }
}

function getClientIdentifier(req) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  return `${email}:${ip}`;
}

export function resendVerificationRateLimit(req, res, next) {
  const windowMs = getWindowMs();
  const key = getClientIdentifier(req);
  const now = Date.now();
  const existing = resendAttempts.get(key);

  if (existing && now < existing.expiresAt) {
    const retryAfterSeconds = Math.ceil((existing.expiresAt - now) / 1000);
    setRateLimitHeaders(res, retryAfterSeconds, windowMs);
    return res.status(429).json({
      success: false,
      message: `Please wait ${retryAfterSeconds}s before requesting another verification email.`,
      retryAfterSeconds,
    });
  }

  resendAttempts.set(key, { expiresAt: now + windowMs });
  setRateLimitHeaders(res, 0, windowMs);

  // Best-effort pruning to prevent map growth over time.
  if (resendAttempts.size > 1000) {
    for (const [attemptKey, attempt] of resendAttempts.entries()) {
      if (attempt.expiresAt <= now) {
        resendAttempts.delete(attemptKey);
      }
    }
  }

  next();
}
