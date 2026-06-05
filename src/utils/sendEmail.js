import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // If SMTP variables are missing, fallback to console logging for local testing
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('---------------------------------------------------------');
    console.log('📧 NO SMTP CONFIG FOUND. LOGGING EMAIL TO CONSOLE INSTEAD:');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('---------------------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Lalbaug Roti House'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML message
    attachments: options.attachments,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
