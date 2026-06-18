require("dotenv").config();
const nodemailer = require("nodemailer");

async function test() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "CHIC Clothing Test",
      text: "Email service is working successfully!",
    });

    console.log("✅ Email Sent");
    console.log(info.messageId);
  } catch (err) {
    console.error("❌ Email Failed");
    console.error(err);
  }
}

test();