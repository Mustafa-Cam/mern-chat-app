const jwt = require("jsonwebtoken");

const generateToken = (id) => {  // jwt oluşturuyoruz
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
