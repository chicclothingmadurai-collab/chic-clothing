require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const User = require("./models/User");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/chic-clothing";

const admins = [
  {
    name: "Kishore G",
    email: "kishoreg@student.tce.edu",
    password: "Kishore@123",
    role: "admin",
  },
  {
    name: "Kalam",
    email: "Kalamcricketer@gmail.com",
    password: "Kalam@123",
    role: "admin",
  },
  {
    name: "Somu",
    email: "SOMU24397@gmail.com",
    password: "Somu@123",
    role: "admin",
  },
  {
    name: "Syed Shamil",
    email: "Syedshamil3088@gmail.com",
    password: "Shamil@123",
    role: "admin",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    for (const admin of admins) {
      const existing = await User.findOne({
        email: admin.email,
      });

      if (!existing) {
        await User.create(admin);
        console.log(
          `✅ Admin created: ${admin.email}`
        );
      } else {
        console.log(
          `ℹ️ Admin already exists: ${admin.email}`
        );
      }
    }

    console.log("🎉 Admin setup completed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();