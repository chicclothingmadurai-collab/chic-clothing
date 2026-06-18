require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { id: "123" },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);

console.log(token);

const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET
);

console.log(decoded);