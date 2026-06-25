console.log(
  "RESEND KEY EXISTS:",
  !!process.env.RESEND_API_KEY
);

const { Resend } = require("resend");


const resend = new Resend(process.env.RESEND_API_KEY);

// Accepts either a single email string or an array of email strings
const sendEmail = async (to, subject, html) => {
  try {
    const result = await resend.emails.send({
      from: "CHIC Clothing <orders@chicclothing.in>",   // changed to your verified domain
      to,                                               // Resend accepts array or string
      subject,
      html,
    });

    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Email error:", error);
    throw error; // rethrow so caller can handle
  }
};

module.exports = sendEmail;