const { BrevoClient } = require('@getbrevo/brevo');

/**
 * Brevo Email Service (SDK v5)
 */
const sendEmail = async (to, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }

  const client = new BrevoClient({ apiKey });

  const emailData = {
    sender: {
      name: 'Remote Tracker',
      email: process.env.FROM_EMAIL || 'no-reply@remotetracker.app',
    },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    const result = await client.transactionalEmails.sendTransacEmail(emailData);
    console.log('✅ Brevo email sent to:', to, '| MessageId:', result.messageId || result.body?.messageId);
    return result;
  } catch (error) {
    console.error('❌ Brevo sendEmail error:', error?.response?.body || error?.message || error);
    throw new Error('Failed to send email via Brevo: ' + (error?.response?.body?.message || error?.message));
  }
};

const sendOTP = async (user, otp) => {
  const subject = 'Your Verification Code – Remote Tracker';
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
      <div style="background: #000; padding: 24px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">REMOTE TRACKER</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #111; margin: 0 0 12px;">Verify your email</h2>
        <p style="color: #6b7280; margin: 0 0 28px; font-size: 15px; line-height: 1.6;">
          Hello <strong>${user.firstName}</strong>, use the code below to verify your email address. It expires in 10 minutes.
        </p>
        <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 28px;">
          <span style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #000; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">If you didn't create a Remote Tracker account, you can safely ignore this email.</p>
      </div>
      <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">&copy; ${new Date().getFullYear()} Remote Tracker. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail(user.email, subject, htmlContent);
};

module.exports = { sendEmail, sendOTP };
