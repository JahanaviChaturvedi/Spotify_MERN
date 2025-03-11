const jwt = require("jsonwebtoken");

exports.getToken = async (email, user) => {
  const token = jwt.sign({ identifier: user._id }, process.env.SECRET_KEY, {expiresIn: '7d'});
  return token;
};

module.exports = exports;
