import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";

export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      "SkillSphere Password Reset OTP",
      `
        <h2>Password Reset Request</h2>
        <p>Your SkillSphere password reset OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    console.error("Password Reset OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.passwordResetOTP !== otp ||
      !user.passwordResetOTPExpiry ||
      user.passwordResetOTPExpiry < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.password = newPassword;
    user.passwordResetOTP = "";
    user.passwordResetOTPExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};