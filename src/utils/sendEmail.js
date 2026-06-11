import nodemailer from "nodemailer";
import axios from "axios";

const sendEmail = async (options) => {
  // If SMTP variables are missing, fallback to console logging for local testing
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("---------------------------------------------------------");
    console.log("📧 NO SMTP CONFIG FOUND. LOGGING EMAIL TO CONSOLE INSTEAD:");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log("---------------------------------------------------------");
    return;
  }

  // --- VERCEL PROXY BYPASS FOR RENDER ---
  // If we are in production, Render blocks outbound SMTP (port 587).
  // We proxy the email request through our Vercel frontend, which allows SMTP.
  if (process.env.NODE_ENV === "production") {
    try {
      const response = await axios.post("https://lalbaug-roti-house-web.vercel.app/api/send-email", {
        secret: "Lalbaug-Roti-House-Email-Bypass-Secret-2026",
        options: {
          email: options.email,
          subject: options.subject,
          message: options.message,
          html: options.html,
        }
      });

      console.log("Message sent via Vercel Proxy:", response.data.messageId);
      return;
    } catch (err) {
      console.error("Vercel Proxy Email Failed:", err.message);
      throw new Error("Failed to send email via Vercel Proxy. " + err.message);
    }
  }

  // --- LOCALHOST DIRECT SMTP ---
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Force IPv4 and add timeouts for Render compatibility
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const message = {
    from: `${process.env.FROM_NAME || "Lalbaug Roti House"} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML message
    attachments: options.attachments,
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};

export default sendEmail;
