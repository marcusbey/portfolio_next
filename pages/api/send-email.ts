import { NextApiRequest, NextApiResponse } from 'next';
import { Resend, CreateEmailResponse } from 'resend';
import { EmailTemplate } from '@/components/email-template';

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

const getEmailConfig = (senderEmail: string) => {
  const fromName = config.isDevelopment ? 'Romain BOBOE (Dev)' : 'Romain BOBOE';
  const fromEmail = config.isDevelopment ? 'onboarding@resend.dev' : config.contactEmail;
  
  return {
    from: `${fromName} <${fromEmail}>`,
    to: config.contactEmail,
    replyTo: senderEmail,
    subject: `${config.isDevelopment ? '[TEST] ' : ''}📨 New Message from RomainBOBOE.com`
  };
};

// Validate email configuration
const validateEmailConfig = () => {
  if (!config.contactEmail) {
    throw new Error('CONTACT_FORM_EMAIL is required');
  }
  if (!config.contactEmail.includes('@')) {
    throw new Error('CONTACT_FORM_EMAIL must be a valid email address');
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
      error: 'Failed to initialize Resend client'
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
        message: 'Missing required fields',
        error: 'Email and message are required'
      });
    }

    // Send email
    const emailConfig = getEmailConfig(email);
    
    // Debug logging
    console.log('Sending email with config:', {
      ...emailConfig,
      message: message.substring(0, 100) + '...' // Only log first 100 chars
    });
    
    const result: CreateEmailResponse = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.to as string,
      subject: emailConfig.subject,
      replyTo: emailConfig.replyTo,
      react: EmailTemplate({ senderEmail: email, message }) // Use React component
    });

    // Debug logging
    console.log('Email API response:', result);

    // Type guard to check if result is an error
    if ('error' in result && result.error) {
      throw new Error(result.error.message || 'Failed to send email');
    }

    if (!result.data) {
      throw new Error('No response data from email service');
    }

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
