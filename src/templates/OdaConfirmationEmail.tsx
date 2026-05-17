import * as React from 'react';

interface OdaConfirmationEmailProps {
  confirmationUrl: string;
  userType?: 'buyer' | 'seller';
}

export const OdaConfirmationEmail: React.FC<Readonly<OdaConfirmationEmailProps>> = ({
  confirmationUrl,
  userType = 'buyer',
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirm Your ODA Registration</title>
      </head>
      <body style={styles.body}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={styles.wrapper}>
          <tr>
            <td align="center">
              <table cellPadding="0" cellSpacing="0" style={styles.container}>
                {/* Header */}
                <tr>
                  <td style={styles.header}>
                    <h1 style={styles.logo}>ODA</h1>
                  </td>
                </tr>
                
                {/* Content */}
                <tr>
                  <td style={styles.content}>
                    <h2 style={styles.heading}>Welcome to the Marketplace</h2>
                    <p style={styles.text}>Hello,</p>
                    <p style={styles.text}>
                      Thank you for registering with ODA as a {userType}. We're building the premier industrial manufacturing and sourcing network across Africa.
                    </p>
                    <p style={styles.text}>
                      To finalize your account setup and access the platform, please confirm your email address by clicking the button below:
                    </p>
                    
                    <div style={styles.btnContainer}>
                      <a href={confirmationUrl} style={styles.btn}>
                        Verify Email Address
                      </a>
                    </div>
                    
                    <p style={styles.text}>
                      If you have any questions or need assistance navigating the platform, our support team is always here to help.
                    </p>
                    
                    <hr style={styles.divider} />
                    
                    <p style={styles.smallText}>
                      If you did not request this account, please ignore this email. The link will expire in 24 hours.
                    </p>
                  </td>
                </tr>
                
                {/* Footer */}
                <tr>
                  <td style={styles.footer}>
                    <p style={styles.footerText}>&copy; {new Date().getFullYear()} ODA Network. All rights reserved.</p>
                    <p style={styles.footerText}>
                      <a href="https://oda.network" style={styles.footerLink}>oda.network</a> | Nairobi, Kenya
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

const styles = {
  body: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#F5F2EA',
    margin: 0,
    padding: 0,
    WebkitFontSmoothing: 'antialiased',
  },
  wrapper: {
    backgroundColor: '#F5F2EA',
    padding: '40px 0',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6D5B8',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(62, 44, 35, 0.05)',
  },
  header: {
    backgroundColor: '#3E2C23',
    padding: '32px 40px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#FFFFFF',
    margin: 0,
    fontSize: '28px',
    letterSpacing: '4px',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
  },
  content: {
    padding: '40px',
    color: '#3E2C23',
  },
  heading: {
    marginTop: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#3E2C23',
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#5A4A42',
    marginBottom: '24px',
  },
  btnContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  btn: {
    display: 'inline-block',
    backgroundColor: '#556B2F',
    color: '#FFFFFF',
    textDecoration: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  divider: {
    borderTop: 'none',
    borderBottom: '1px solid #E6D5B8',
    margin: '32px 0',
  },
  smallText: {
    fontSize: '12px',
    color: '#8C7B71',
    marginTop: '24px',
  },
  footer: {
    backgroundColor: '#FAF9F6',
    padding: '24px 40px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#8C7B71',
    margin: '4px 0',
  },
  footerLink: {
    color: '#556B2F',
    textDecoration: 'none',
  },
};
