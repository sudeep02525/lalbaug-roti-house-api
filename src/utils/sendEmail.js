// import nodemailer from 'nodemailer';

// const sendEmail = async (options) => {
//   // If SMTP variables are missing, fallback to console logging for local testing
//   if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
//     console.log('---------------------------------------------------------');
//     console.log('📧 NO SMTP CONFIG FOUND. LOGGING EMAIL TO CONSOLE INSTEAD:');
//     console.log(`To: ${options.email}`);
//     console.log(`Subject: ${options.subject}`);
//     console.log(`Message: \n${options.message}`);
//     console.log('---------------------------------------------------------');
//     return;
//   }

//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT || 587,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   const message = {
//     from: `${process.env.FROM_NAME || 'Lalbaug Roti House'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: options.html, // Optional HTML message
//     attachments: options.attachments,
//   };

//   const info = await transporter.sendMail(message);

//   console.log('Message sent: %s', info.messageId);
// };

// export default sendEmail;
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    console.log("\n===== sendEmail START =====");

    console.log("SMTP Configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
    });

    // Fallback if SMTP isn't configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log("NO SMTP CONFIG FOUND. LOGGING EMAIL TO CONSOLE INSTEAD:");
      console.log("To:", options.email);
      console.log("Subject:", options.subject);
      console.log("Message:", options.message);
      console.log("===== sendEmail END =====\n");
      return;
    }

    console.log("Creating transporter...");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),

      // Gmail + 465 requires secure=true
      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log("Transporter created");

    const message = {
      from: `${process.env.FROM_NAME || "Lalbaug Roti House"} <${
        process.env.FROM_EMAIL || process.env.SMTP_USER
      }>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
      attachments: options.attachments || [],
    };

    console.log("About to send email...");
    console.log("Recipient:", options.email);
    console.log("Subject:", options.subject);

    const startTime = Date.now();

    const info = await transporter.sendMail(message);

    const duration = Date.now() - startTime;

    console.log("Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log(`Duration: ${duration}ms`);

    console.log("===== sendEmail END =====\n");

    return info;
  } catch (err) {
    console.error("\n===== sendEmail ERROR =====");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Command:", err.command);
    console.error("Stack:", err.stack);
    console.error("===== sendEmail ERROR END =====\n");

    throw err;
  }
};

export default sendEmail;
