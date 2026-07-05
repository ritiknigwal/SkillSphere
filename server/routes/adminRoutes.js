import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAllSkills,
  deleteSkillByAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);

// Users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

router.put(
  "/users/:id/block",
  authMiddleware,
  adminMiddleware,
  toggleUserStatus
);

// Skills
router.get(
  "/skills",
  authMiddleware,
  adminMiddleware,
  getAllSkills
);

router.delete(
  "/skills/:id",
  authMiddleware,
  adminMiddleware,
  deleteSkillByAdmin
);

export default router;