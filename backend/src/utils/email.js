import nodemailer from 'nodemailer';

/**
 * Configure the transporter using SMTP credentials from environment variables.
 * If credentials are not provided, it will log a warning and fall back to a mock transporter
 * that simply logs the email contents to the console (useful for local development).
 */
let transporter;

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.warn('⚠️ SMTP credentials not fully configured in .env file.');
    console.warn('⚠️ Using mock email transporter. Emails will be logged to the console.');
    
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n================ MOCK EMAIL ================');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Text: \n${mailOptions.text}`);
        if (mailOptions.html) {
          console.log(`HTML: \n${mailOptions.html}`);
        }
        console.log('============================================\n');
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }
};

createTransporter();

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, text, html)
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || '"Campus Adda" <noreply@campusadda.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
