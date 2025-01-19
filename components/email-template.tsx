import * as React from 'react';

interface EmailTemplateProps {
  senderEmail: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  senderEmail,
  message,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#1f2937', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px' 
      }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ width: '32px', height: '32px', color: '#06b6d4' }}
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <h1 style={{ margin: 0 }}>New Message from Your Website</h1>
      </div>

      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <p>Hello Romain,</p>
        <p>You've received a new message from your website contact form.</p>
        
        <h2 style={{ color: '#1f2937' }}>Sender Details</h2>
        <p><strong>Email:</strong> {senderEmail}</p>
        
        <h2 style={{ color: '#1f2937' }}>Message</h2>
        <p style={{ 
          background: 'white', 
          padding: '15px', 
          borderRadius: '4px', 
          border: '1px solid #e5e7eb' 
        }}>
          {message.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '0.875rem' }}>
        <p>This message was sent from the contact form on RomainBOBOE.com</p>
      </div>
    </div>
  </div>
);
