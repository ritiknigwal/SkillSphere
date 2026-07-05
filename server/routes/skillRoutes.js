import express from "express";
import {
  addSkill,
  getMySkills,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { searchSkills } from "../controllers/skillController.js";

const router = express.Router();

router.post("/add", authMiddleware, addSkill);
router.get("/my-skills", authMiddleware, getMySkills);
router.put("/:id", authMiddleware, updateSkill);
router.delete("/:id", authMiddleware, deleteSkill);
router.get("/search", authMiddleware, searchSkills);

export default router;