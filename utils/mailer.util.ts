import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, name: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME!,
      pass: process.env.EMAIL_PASSWORD!
    }
  });

  await transporter.sendMail({
    from: '"CogniBuddy" <noreply@cognibuddy.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `
  });
};
