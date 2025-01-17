import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, message } = req.body;

    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'hi@romainboboe.com',
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
      `,
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
}
