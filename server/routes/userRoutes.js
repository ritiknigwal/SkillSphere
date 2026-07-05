import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadResume,
  getAllUsers,
  getUserById,
  updateLastSeen,
  togglePinChat,
  toggleArchiveChat,
} from "../controllers/userController.js";

const router = express.Router();

// Get Profile
router.get("/profile", authMiddleware, getMyProfile);
router.get("/all", authMiddleware, getAllUsers);

// Chat presence/settings
router.put("/last-seen", authMiddleware, updateLastSeen);
router.put("/pin-chat/:userId", authMiddleware, togglePinChat);
router.put("/archive-chat/:userId", authMiddleware, toggleArchiveChat);

router.get("/:id", authMiddleware, getUserById);

// Update Profile
router.put("/profile", authMiddleware, updateProfile);

// Upload Profile Photo
router.post(
  "/profile-photo",
  authMiddleware,
  upload.single("profilePhoto"),
  uploadProfilePhoto
);

// Resume upload route
router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

export default router;