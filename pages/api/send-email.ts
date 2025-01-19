import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Define Resend API response type
interface ErrorResponse {
  name: string;
  message: string;
}

interface ResendEmailResponse {
  data: {
    id: string;
  } | null;
  error: ErrorResponse | null;
}

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_FORM_EMAIL = process.env.CONTACT_FORM_EMAIL;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://romainboboe.com';

// Validate environment
function validateEnvironment() {
  const issues = [];
  
  if (!RESEND_API_KEY) {
    issues.push('RESEND_API_KEY is missing');
  } else if (!RESEND_API_KEY.startsWith('re_')) {
    issues.push('RESEND_API_KEY is invalid format');
  }
  
  if (!CONTACT_FORM_EMAIL) {
    issues.push('CONTACT_FORM_EMAIL is missing');
  }
  
  if (!IS_DEVELOPMENT && !SITE_URL) {
    issues.push('NEXT_PUBLIC_SITE_URL is missing in production');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Initialize Resend
let resend: Resend | null = null;
try {
  const envValidation = validateEnvironment();
  console.log('Environment validation:', {
    isValid: envValidation.isValid,
    issues: envValidation.issues,
    isDevelopment: IS_DEVELOPMENT,
    siteUrl: SITE_URL,
    apiUrl: API_URL,
    hasContactEmail: !!CONTACT_FORM_EMAIL,
    hasResendKey: !!RESEND_API_KEY,
    nodeEnv: process.env.NODE_ENV
  });

  if (!envValidation.isValid) {
    throw new Error(`Environment validation failed: ${envValidation.issues.join(', ')}`);
  }
  
  resend = new Resend(RESEND_API_KEY);
  console.log('Resend initialized successfully', {
    isDevelopment: IS_DEVELOPMENT,
    siteUrl: SITE_URL,
    apiUrl: API_URL,
    contactEmail: CONTACT_FORM_EMAIL
  });
} catch (error) {
  console.error('Error initializing Resend:', error);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('=== Email API Handler Start ===');
  console.log('Request details:', {
    method: req.method,
    url: req.url,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    }
  });

  // Set CORS headers
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://romainboboe.com',
    'https://www.romainboboe.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  if (allowedOrigins.includes(origin) || IS_DEVELOPMENT) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!resend) {
    console.error('Resend client not initialized', {
      apiKeySet: !!RESEND_API_KEY,
      apiKeyValid: RESEND_API_KEY?.startsWith('re_'),
      environment: process.env.NODE_ENV
    });
    return res.status(500).json({
      success: false,
      message: 'Email service not initialized',
      error: 'Internal server error'
    });
  }

  try {
    console.log('Processing request body:', req.body);
    const { email, message } = req.body;

    if (!email || !message) {
      console.error('Missing required fields:', { 
        emailProvided: !!email, 
        messageProvided: !!message 
      });
      return res.status(400).json({ message: 'Email and message are required' });
    }

    if (!CONTACT_FORM_EMAIL) {
      console.error('Missing CONTACT_FORM_EMAIL in environment:', { 
        CONTACT_FORM_EMAIL_SET: !!CONTACT_FORM_EMAIL,
        IS_DEVELOPMENT,
        NODE_ENV: process.env.NODE_ENV
      });
      return res.status(500).json({ 
        message: 'Email service configuration error',
        details: 'Recipient email is missing'
      });
    }

    const recipientEmail = CONTACT_FORM_EMAIL;
    console.log('Email configuration:', {
      from: 'Contact Form <hi@romainboboe.com>',
      to: recipientEmail,
      replyTo: email,
      IS_DEVELOPMENT,
      RESEND_API_KEY_SET: !!RESEND_API_KEY,
      RESEND_API_KEY_VALID: RESEND_API_KEY?.startsWith('re_')
    });

    // Email configuration based on environment
    const fromEmail = IS_DEVELOPMENT 
      ? 'Romain BOBOE <onboarding@resend.dev>'
      : `Contact Form <${CONTACT_FORM_EMAIL}>`;  // Use verified email in production

    const toEmail = IS_DEVELOPMENT 
      ? 'rboboe@gmail.com'
      : CONTACT_FORM_EMAIL;

    console.log('Email environment configuration:', {
      IS_DEVELOPMENT,
      fromEmail,
      toEmail,
      SITE_URL,
      API_URL,
      NODE_ENV: process.env.NODE_ENV,
      host: req.headers.host
    });

    // Validate production setup
    if (!IS_DEVELOPMENT) {
      const productionDomain = CONTACT_FORM_EMAIL?.split('@')[1];
      console.log('Production email configuration:', {
        fromEmail,
        toEmail,
        productionDomain,
        host: req.headers.host,
        siteUrl: SITE_URL,
        apiUrl: API_URL
      });

      if (productionDomain !== 'romainboboe.com') {
        console.error('Production domain mismatch:', {
          expectedDomain: 'romainboboe.com',
          actualDomain: productionDomain
        });
        return res.status(500).json({
          success: false,
          message: 'Email configuration error',
          error: 'Invalid email domain configuration'
        });
      }
    }

    const emailData = {
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `${IS_DEVELOPMENT ? '[TEST] ' : ''}📨 New Message from RomainBOBOE.com`,
      html: `
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
              ${IS_DEVELOPMENT ? '.dev-banner { background: #fde68a; color: #92400e; padding: 10px; text-align: center; margin-bottom: 20px; }' : ''}
            </style>
          </head>
          <body>
            <div class="container">
              ${IS_DEVELOPMENT ? '<div class="dev-banner">⚠️ This is a test email from development environment</div>' : ''}
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
                ${IS_DEVELOPMENT ? '<p style="color: #92400e;">Note: In development mode, emails are only sent to verified addresses.</p>' : ''}
                <p style="color: #6b7280; font-size: 0.75rem;">Sent from ${req.headers.host || SITE_URL}</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    console.log('Sending email with data:', {
      to: emailData.to,
      from: emailData.from,
      replyTo: emailData.replyTo,
      subject: emailData.subject,
      environment: process.env.NODE_ENV,
      apiKeyPrefix: RESEND_API_KEY?.substring(0, 5),
      isDevelopment: IS_DEVELOPMENT,
      resendInitialized: !!resend,
      siteUrl: SITE_URL,
      apiUrl: API_URL,
      host: req.headers.host,
      origin: req.headers.origin
    });

    try {
      const result = await resend.emails.send(emailData);
      console.log('Resend API Full Response:', JSON.stringify(result, null, 2));

      if (result.error) {
        throw result.error;
      }

      console.log('Email sent successfully:', {
        id: result.data?.id,
        to: emailData.to,
        from: emailData.from,
        environment: process.env.NODE_ENV
      });

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        id: result.data?.id
      });
    } catch (error) {
      console.error('Failed to send email:', {
        error,
        environment: process.env.NODE_ENV,
        isDevelopment: IS_DEVELOPMENT,
        fromEmail: emailData.from,
        toEmail: emailData.to,
        host: req.headers.host,
        origin: req.headers.origin
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error: any) {
    console.error('General error in API route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
}
