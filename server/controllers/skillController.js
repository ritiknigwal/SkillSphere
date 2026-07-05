import Skill from "../models/Skill.js";

export const addSkill = async (req, res) => {
  try {
    const { name, category, level, description } = req.body;

    const skill = await Skill.create({
      name,
      category,
      level,
      description,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Skill added successfully",
      skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
      error: error.message,
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this skill",
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete skill",
      error: error.message,
    });
  }
};

export const updateSkill = async (req, res) => {
  try {
    console.log("========== UPDATE SKILL ==========");
    console.log("ID from URL:", req.params.id);
    console.log("Logged in User:", req.user._id);
    console.log("Request Body:", req.body);

    const skill = await Skill.findById(req.params.id);

    console.log("Skill found:", skill);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    if (skill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this skill",
      });
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("Updated Skill:", updatedSkill);

    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("Update Skill Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update skill",
      error: error.message,
    });
  }
};

//for global level skill search API
export const searchSkills = async (req, res) => {
  try {
    const { q } = req.query;

    const skills = await Skill.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { level: { $regex: q, $options: "i" } },
      ],
    }).populate("user", "fullName profileImage location");

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};