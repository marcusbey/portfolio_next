import type { NextApiRequest, NextApiResponse } from 'next';
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
  email: string | null;
  details?: {
    email: string | null;
    message: string | null;
  };
}

// Environment configuration
const config = {
  resendKey: process.env.RESEND_API_KEY,
  contactEmail: process.env.CONTACT_FORM_EMAIL || 'hi@romainboboe.com',
  devEmail: 'rboboe@gmail.com',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://www.romainboboe.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.romainboboe.com',
  isDevelopment: process.env.NODE_ENV === 'development',
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.romainboboe.com',
    'https://romainboboe.com'
  ]
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
  const fromConfig = config.isDevelopment 
    ? {
        name: 'Romain BOBOE (Dev)',
        email: 'onboarding@resend.dev'
      }
    : {
        name: 'Romain BOBOE',
        email: 'email@romainboboe.com'
      };
  
  // In development, MUST send to the verified email (rboboe@gmail.com)
  // In production, can send to any email after domain verification
  const toEmail = config.isDevelopment 
    ? config.devEmail  // rboboe@gmail.com
    : config.contactEmail; // hi@romainboboe.com
  
  return {
    from: `${fromConfig.name} <${fromConfig.email}>`,
    to: toEmail,
    replyTo: senderEmail,
    subject: `${config.isDevelopment ? '[TEST] ' : ''}📨 New Message from RomainBOBOE.com`
  };
};

// Validate email configuration
const validateEmailConfig = () => {
  if (!config.contactEmail) {
    return 'CONTACT_FORM_EMAIL is required';
  }
  if (!config.contactEmail.includes('@')) {
    return 'CONTACT_FORM_EMAIL must be a valid email address';
  }
  return null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Handle CORS
  const origin = req.headers.origin as typeof config.allowedOrigins[number] | undefined;
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed',
      error: 'Method not allowed',
      email: null,
      details: {
        email: null,
        message: null
      }
    });
  }

  try {
    const { email, message } = req.body as EmailRequest;

    if (!email || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        error: 'Missing required fields',
        email: null,
        details: {
          email: !email ? 'Email is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }

    // Validate email configuration
    const validationError = validateEmailConfig();
    if (validationError) {
      console.error('Email configuration error:', validationError);
      return res.status(500).json({ 
        success: false,
        message: 'Email configuration error',
        error: validationError,
        email: null,
        details: {
          email: null,
          message: null
        }
      });
    }

    // Send email
    const emailConfig = getEmailConfig(email);
    
    // Debug logging
    console.log('Environment:', {
      isDevelopment: config.isDevelopment,
      apiUrl: config.apiUrl,
      siteUrl: config.siteUrl,
      contactEmail: config.contactEmail,
      host: req.headers.host,
      origin: req.headers.origin
    });
    
    console.log('Email config:', {
      from: emailConfig.from,
      to: emailConfig.to,
      replyTo: emailConfig.replyTo,
      subject: emailConfig.subject
    });

    if (!resend) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize email client',
        error: 'Email client initialization failed',
        email: null,
        details: {
          email: null,
          message: null
        }
      });
    }

    const result: CreateEmailResponse = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.to as string,
      subject: emailConfig.subject,
      replyTo: emailConfig.replyTo,
      react: EmailTemplate({ senderEmail: email, message })
    });

    console.log('Resend API response:', JSON.stringify(result, null, 2));

    if (result.error) {
      throw new Error(result.error.message);
    }

    return res.status(200).json({ 
      success: true,
      message: 'Email sent successfully',
      id: result.data?.id,
      email: email,
      details: {
        email: null,
        message: null
      }
    });

  } catch (error: any) {
    console.error('Failed to send email:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to send email',
      error: error.message,
      email: null,
      details: {
        email: null,
        message: null
      }
    });
  }
}
