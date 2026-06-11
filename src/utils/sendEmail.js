import axios from "axios";

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

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: `${process.env.FROM_NAME || "Lalbaug Roti House"} <${process.env.FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional HTML message
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Message sent via Resend: %s", response.data.id);
  } catch (error) {
    console.error("Resend API Email Failed:", error.response?.data || error.message);
    throw new Error("Failed to send email via Resend. " + (error.response?.data?.message || error.message));
  }
};

export default sendEmail;
