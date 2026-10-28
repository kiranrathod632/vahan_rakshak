/**
 * Helper to determine client base URL dynamically
 * Ensures QR codes generated on live site point to the live domain
 * instead of localhost.
 */
const getClientBaseUrl = (req) => {
  // 1. Explicit baseUrl in payload (e.g. from frontend window.location.origin)
  if (req?.body?.baseUrl && typeof req.body.baseUrl === 'string' && req.body.baseUrl.startsWith('http')) {
    return req.body.baseUrl.replace(/\/$/, '');
  }

  // 2. Browser Origin header (sent by browser with POST / PUT)
  const origin = req?.get ? req.get('origin') : (req?.headers ? req.headers.origin : null);
  if (origin && typeof origin === 'string' && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return origin.replace(/\/$/, '');
  }

  // 3. Browser Referer header
  const referer = req?.get ? req.get('referer') : (req?.headers ? req.headers.referer : null);
  if (referer && typeof referer === 'string') {
    try {
      const refUrl = new URL(referer);
      if (!refUrl.origin.includes('localhost') && !refUrl.origin.includes('127.0.0.1')) {
        return refUrl.origin.replace(/\/$/, '');
      }
    } catch (e) {}
  }

  // 4. Configured non-localhost CLIENT_URL in environment
  if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost') && !process.env.CLIENT_URL.includes('127.0.0.1')) {
    return process.env.CLIENT_URL.replace(/\/$/, '');
  }

  // 5. Configured non-localhost APP_BASE_URL
  if (process.env.APP_BASE_URL && !process.env.APP_BASE_URL.includes('localhost') && !process.env.APP_BASE_URL.includes('127.0.0.1')) {
    return process.env.APP_BASE_URL.replace(/\/$/, '');
  }

  // 6. If origin exists even on localhost, respect it
  if (origin && typeof origin === 'string') {
    return origin.replace(/\/$/, '');
  }

  // 7. Local development default
  return (process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
};

module.exports = { getClientBaseUrl };
