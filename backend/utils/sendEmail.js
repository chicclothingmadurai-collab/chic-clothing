const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const result = await resend.emails.send({
      from: "CHIC Clothing <orders@chicclothing.in>",
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${Array.isArray(to) ? to.join(", ") : to}`);
    return result;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};

module.exports = sendEmail;