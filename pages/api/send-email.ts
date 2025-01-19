import { NextApiRequest, NextApiResponse } from 'next';
import { Resend, CreateEmailResponse } from 'resend';

interface EmailRequest {
  email: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  id?: string;
  error?: string;
}

// Environment configuration
const config = {
  resendKey: process.env.RESEND_API_KEY,
  contactEmail: process.env.CONTACT_FORM_EMAIL || 'hi@romainboboe.com',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://www.romainboboe.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.romainboboe.com',
  isDevelopment: process.env.NODE_ENV === 'development'
} as const;

// Initialize Resend client
const createResendClient = () => {
  if (!config.resendKey) {
    throw new Error('RESEND_API_KEY is not defined');
  }

  if (!config.resendKey.startsWith('re_')) {
    throw new Error('Invalid API key format. Must start with "re_"');
  }

  return new Resend(config.resendKey);
};

const resend = (() => {
  try {
    return createResendClient();
  } catch (error) {
    console.error('Failed to initialize Resend:', error);
    return null;
  }
})();

const getEmailConfig = (senderEmail: string) => ({
  from: config.isDevelopment
    ? 'Romain BOBOE <onboarding@resend.dev>'
    : `Contact Form <${config.contactEmail}>`,
  to: config.isDevelopment ? 'rboboe@gmail.com' : config.contactEmail,
  replyTo: senderEmail,
  subject: `${config.isDevelopment ? '[TEST] ' : ''}📨 New Message from RomainBOBOE.com`
});

const createEmailTemplate = (email: string, message: string) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; display: flex; align-items: center; gap: 15px; }
      .header svg { width: 32px; height: 32px; }
      .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
      .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.875rem; }
      ${config.isDevelopment ? '.dev-banner { background: #fde68a; color: #92400e; padding: 10px; text-align: center; margin-bottom: 20px; }' : ''}
    </style>
  </head>
  <body>
    <div class="container">
      ${config.isDevelopment ? '<div class="dev-banner">⚠️ This is a test email from development environment</div>' : ''}
      <div class="header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #06b6d4;">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
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
      </div>
      <div class="footer">
        <p>This message was sent from the contact form on RomainBOBOE.com</p>
        ${config.isDevelopment ? '<p style="color: #92400e;">Note: In development mode, emails are only sent to verified addresses.</p>' : ''}
      </div>
    </div>
  </body>
</html>
`;

// Validate email configuration
const validateEmailConfig = () => {
  if (!config.contactEmail) {
    throw new Error('CONTACT_FORM_EMAIL is required');
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Only allow requests from www subdomain in production
  if (!config.isDevelopment && req.headers.host !== 'www.romainboboe.com') {
    console.warn('Invalid host:', req.headers.host);
    return res.status(400).json({
      success: false,
      message: 'Invalid host',
      error: 'Request must come from www.romainboboe.com'
    });
  }

  // Set CORS headers
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://www.romainboboe.com',
    'http://localhost:3000'
  ];

  if (allowedOrigins.includes(origin) || config.isDevelopment) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.romainboboe.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Validate Resend client
  if (!resend) {
    return res.status(500).json({
      success: false,
      message: 'Email service not initialized',
      error: 'Internal server error'
    });
  }

  try {
    // Validate email configuration early
    validateEmailConfig();

    const { email, message } = req.body as EmailRequest;

    // Validate request body
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email and message are required'
      });
    }

    // Send email
    const emailConfig = getEmailConfig(email);
    const emailContent = createEmailTemplate(email, message);
    
    const result: CreateEmailResponse = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.to as string,
      subject: emailConfig.subject,
      replyTo: emailConfig.replyTo,
      react: null,
      html: emailContent
    });

    // Type guard to check if result is an error
    if ('error' in result && result.error) {
      throw new Error(result.error.message || 'Failed to send email');
    }

    if (!result.data) {
      throw new Error('No response data from email service');
    }

    // The successful response has a 'data' property
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: result.data.id
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
