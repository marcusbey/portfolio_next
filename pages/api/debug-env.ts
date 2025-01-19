import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'development') {
    return res.status(200).json({
      environment: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasContactEmail: !!process.env.CONTACT_FORM_EMAIL,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin
      }
    });
  }

  return res.status(404).json({ message: 'Not found' });
}
