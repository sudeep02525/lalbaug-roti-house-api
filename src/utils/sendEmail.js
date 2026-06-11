import { Resend } from "resend";

const sendEmail = async (options) => {
  // If RESEND_API_KEY is missing, fallback to console logging for local testing
  if (!process.env.RESEND_API_KEY) {
    console.log("---------------------------------------------------------");
    console.log("📧 NO RESEND_API_KEY FOUND. LOGGING EMAIL TO CONSOLE INSTEAD:");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log("---------------------------------------------------------");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || "Lalbaug Roti House"} <${process.env.FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Optional HTML message
    });

    if (error) {
      console.error("Resend SDK Error:", error);
      throw new Error(error.message);
    }

    console.log("Message sent via Resend SDK: %s", data.id);
  } catch (err) {
    console.error("Resend SDK Email Failed:", err.message);
    throw new Error("Failed to send email via Resend SDK. " + err.message);
  }
};

export default sendEmail;
