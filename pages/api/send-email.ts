import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Enhanced environment variable checking
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_FORM_EMAIL = process.env.CONTACT_FORM_EMAIL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables');
}

if (!CONTACT_FORM_EMAIL) {
  console.warn('CONTACT_FORM_EMAIL is not set, falling back to default');
}

const resend = new Resend(RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API Route Environment:', {
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!RESEND_API_KEY,
    recipientEmail: CONTACT_FORM_EMAIL || 'hi@romainboboe.com',
    siteUrl: SITE_URL || 'not set'
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, message } = req.body;
    
    console.log('Received request:', {
      hasEmail: !!email,
      emailLength: email?.length,
      hasMessage: !!message,
      messageLength: message?.length,
      timestamp: new Date().toISOString()
    });

    if (!email || !message) {
      console.error('Missing required fields:', { email: !!email, message: !!message });
      return res.status(400).json({ message: 'Email and message are required' });
    }

    const recipientEmail = CONTACT_FORM_EMAIL || 'hi@romainboboe.com';
    console.log('Attempting to send email to:', recipientEmail);

    const emailData = {
      from: 'Contact Form <onboarding@resend.dev>',
      to: recipientEmail,
      replyTo: email,
      subject: '💌 New Message from RomainBOBOE.com',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; }
              .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.875rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Message from Your Website</h1>
              </div>
              <div class="content">
                <p>Hello Romain,</p>
                <p>You've received a new message from your website contact form.</p>
                
                <h2 style="color: #1f2937;">Sender Details</h2>
                <p><strong>Email:</strong> ${email}</p>
                
                <h2 style="color: #1f2937;">Message</h2>
                <p style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
                  ${message.replace(/\n/g, '<br>')}
                </p>
                
                <p style="margin-top: 20px;">
                  To reply, you can either:
                  <ul>
                    <li>Use the reply-to address set in this email</li>
                    <li>Click "Reply" in your email client</li>
                  </ul>
                </p>
              </div>
              <div class="footer">
                <p>This message was sent from the contact form on RomainBOBOE.com</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    console.log('Sending email with data:', {
      to: recipientEmail,
      replyTo: email,
      timestamp: new Date().toISOString()
    });

    const data = await resend.emails.send(emailData);
    
    console.log('Email sent successfully:', {
      id: data.id,
      timestamp: new Date().toISOString()
    });
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: data.id
    });

  } catch (error: any) {
    console.error('Failed to send email:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
}
