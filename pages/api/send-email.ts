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

const config = {
  resendKey: process.env.RESEND_API_KEY,
  contactEmail: process.env.CONTACT_FORM_EMAIL || 'hi@romainboboe.com',
  devEmail: 'rboboe@gmail.com',
  ownerEmail: 'rboboe@gmail.com', // Owner's verified email for testing
  isDevelopment: process.env.NODE_ENV === 'development',
  verifiedDomain: 'romainboboe.com', // Domain is already verified in Resend
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.romainboboe.com',
    'https://romainboboe.com'
  ]
} as const;

const createResendClient = () => {
  if (!config.resendKey?.startsWith('re_')) {
    throw new Error('Invalid or missing RESEND_API_KEY');
  }
  return new Resend(config.resendKey);
};

const resend = (() => {
  try {
    return createResendClient();
  } catch (error) {
    return null;
  }
})();

const getEmailConfig = (senderEmail: string) => {
  // We can use the verified domain address now as 'from'
  return {
    from: `contact@${config.verifiedDomain}`,
    to: config.contactEmail,
    replyTo: senderEmail,
    subject: `${config.isDevelopment ? '[TEST] ' : ''}📨  New Message from RomainBOBOE.com`
  };
};

const validateRequest = (email?: string, message?: string) => {
  const errors = {
    email: !email ? 'Email is required' : null,
    message: !message ? 'Message is required' : null
  };
  return Object.values(errors).some(Boolean) ? errors : null;
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

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Method not allowed',
      email: null,
      details: { email: null, message: null }
    });
  }

  try {
    const { email, message } = req.body as EmailRequest;
    const validationErrors = validateRequest(email, message);

    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'Validation failed',
        email: null,
        details: validationErrors
      });
    }

    if (!resend) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize email client',
        error: 'Email client initialization failed',
        email: null,
        details: { email: null, message: null }
      });
    }
    
    // Domain is now verified, so we can skip the verification check
    // And allow emails from any address

    const emailConfig = getEmailConfig(email);
    console.log('📧 Sending email with config:', { 
      ...emailConfig, 
      messagePreview: message.substring(0, 20) + '...' 
    });
    
    const result = await resend.emails.send({
      ...emailConfig,
      to: emailConfig.to as string,
      react: EmailTemplate({ senderEmail: email, message })
    });

    if (result.error) {
      console.error('❌ Resend API Error:', result.error);
      throw new Error(result.error.message);
    }
    
    console.log('✅ Email sent successfully:', result.data?.id);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: result.data?.id,
      email,
      details: { email: null, message: null }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error',
      email: null,
      details: { email: null, message: null }
    });
  }
}
