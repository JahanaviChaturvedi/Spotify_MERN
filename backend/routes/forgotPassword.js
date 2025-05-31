const crypto = require("crypto");
const User = require("../models/user");
const nodemailer = require("nodemailer");

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with that email." });
    }

    // Generate a unique token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send email with nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USERNAME,
      subject: "Password Reset",
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n
      Please click on the following link to reset your password:\n
      http://localhost:3003/reset-password/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error in forgot password route:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});