require("dotenv").config();

const mongoose = require("mongoose");
const Order = require("./models/Order");

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const result = await Order.deleteMany({});
    console.log(`${result.deletedCount} orders deleted`);
    process.exit();
  })
  .catch(console.error);