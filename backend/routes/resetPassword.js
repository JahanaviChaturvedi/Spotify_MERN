router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
      const user = await user.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }, 
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token." });
      }
  
      user.password = newPassword; 
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: "Password has been reset successfully!" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });