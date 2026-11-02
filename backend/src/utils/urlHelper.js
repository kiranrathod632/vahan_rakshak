/**
 * Helper to determine client base URL dynamically
 * Ensures QR codes generated on live site point to the live domain
 * instead of localhost or protected Vercel preview URLs.
 */
const getClientBaseUrl = (req) => {
  // 1. Explicit baseUrl provided in payload (e.g. from frontend form or admin setting)
  if (req?.body?.baseUrl && typeof req.body.baseUrl === 'string' && req.body.baseUrl.startsWith('http')) {
    return req.body.baseUrl.trim().replace(/\/$/, '');
  }

  // 2. Official Production URL provided by Vercel system environment
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && !process.env.VERCEL_PROJECT_PRODUCTION_URL.includes('localhost')) {
    const prodDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, '');
    const fullProdUrl = prodDomain.startsWith('http') ? prodDomain : `https://${prodDomain}`;
    // If not a localhost origin request, prefer canonical production URL
    const origin = req?.get ? req.get('origin') : (req?.headers ? req.headers.origin : null);
    if (!origin || !origin.includes('localhost')) {
      return fullProdUrl;
    }
  }

  // 3. Configured non-localhost CLIENT_URL in environment
  if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost') && !process.env.CLIENT_URL.includes('127.0.0.1')) {
    return process.env.CLIENT_URL.trim().replace(/\/$/, '');
  }

  // 4. Configured non-localhost APP_BASE_URL
  if (process.env.APP_BASE_URL && !process.env.APP_BASE_URL.includes('localhost') && !process.env.APP_BASE_URL.includes('127.0.0.1')) {
    return process.env.APP_BASE_URL.trim().replace(/\/$/, '');
  }

  // 5. Browser Origin header (sent by browser with POST / PUT)
  const origin = req?.get ? req.get('origin') : (req?.headers ? req.headers.origin : null);
  if (origin && typeof origin === 'string' && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return origin.trim().replace(/\/$/, '');
  }

  // 6. Browser Referer header
  const referer = req?.get ? req.get('referer') : (req?.headers ? req.headers.referer : null);
  if (referer && typeof referer === 'string') {
    try {
      const refUrl = new URL(referer);
      if (!refUrl.origin.includes('localhost') && !refUrl.origin.includes('127.0.0.1')) {
        return refUrl.origin.trim().replace(/\/$/, '');
      }
    } catch (e) {}
  }

  // 7. If origin exists even on localhost, respect it
  if (origin && typeof origin === 'string') {
    return origin.trim().replace(/\/$/, '');
  }

  // 8. Local development default
  return (process.env.CLIENT_URL || process.env.APP_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
};

module.exports = { getClientBaseUrl };
