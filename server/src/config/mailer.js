import nodemailer from 'nodemailer';

const REQUIRED_SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingSmtpVars = REQUIRED_SMTP_VARS.filter((key) => !process.env[key]);
if (missingSmtpVars.length > 0) {
  console.warn(
    `[mailer] Missing SMTP env vars: ${missingSmtpVars.join(', ')}. Outgoing email will fail until these are configured in server/.env.`
  );
}

const port = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // false for 587 (STARTTLS); true only for implicit TLS on 465
  requireTLS: true,
  connectionTimeout: 10000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = ({ to, subject, html, text }) => {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
};

export default transporter;
