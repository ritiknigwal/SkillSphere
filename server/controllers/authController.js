import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();

    const user = await User.create({
      fullName,
      email,
      password,
      isVerified: false,
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: Date.now() + 10 * 60 * 1000,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    await sendEmail(
      user.email,
      "SkillSphere Email Verification OTP",
      `
        <h2>Welcome to SkillSphere</h2>
        <p>Your email verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `
    );

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isVerified: user.isVerified,
      message: "Registration successful. Verification OTP sent to your email.",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    let isMatch = false;

    if (user.matchPassword) {
      isMatch = await user.matchPassword(password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by the administrator.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before login",
        email: user.email,
        isVerified: false,
      });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};