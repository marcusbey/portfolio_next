import * as React from 'react';

interface EmailTemplateProps {
  senderEmail: string;
  message: string;
  senderName?: string;
  subject?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  senderEmail,
  message,
  senderName,
  subject,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px',
      }}>
        <p>Hello Romain,</p>
        
        <div style={{ marginTop: '20px' }}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
        
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e5e7eb',
          borderRadius: '6px'
        }}>
          {senderName && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Name:</strong> {senderName}
            </p>
          )}
          {subject && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Subject:</strong> {subject}
            </p>
          )}
          <p style={{ margin: 0 }}>
            <strong>From:</strong> {senderEmail}
          </p>
        </div>
      </div>
    </div>
  </div>
);
