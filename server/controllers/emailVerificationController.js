import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";

export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const otp = generateOTP();

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      "SkillSphere Email Verification OTP",
      `
        <h2>Email Verification</h2>
        <p>Your SkillSphere verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
  console.error("Send OTP Error:", error);

  res.status(500).json({
    success: false,
    message: "Failed to send OTP",
    error: error.message,
  });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.emailVerificationOTP !== otp ||
      !user.emailVerificationOTPExpiry ||
      user.emailVerificationOTPExpiry < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.emailVerificationOTP = "";
    user.emailVerificationOTPExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};