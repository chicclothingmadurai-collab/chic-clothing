console.log(
  "RESEND KEY EXISTS:",
  !!process.env.RESEND_API_KEY
);

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const result = await resend.emails.send({
      from: "CHIC Clothing <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("Email sent:", result);
  } catch (error) {
    console.error("Email error:", error);
  }
};

module.exports = sendEmail;