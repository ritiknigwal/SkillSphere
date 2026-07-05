import User from "../models/User.js";

// GET LOGGED IN USER PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      headline,
      bio,
      location,
      github,
      linkedin,
      portfolio,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.fullName = fullName || user.fullName;
    user.headline = headline || user.headline;
    user.bio = bio || user.bio;
    user.location = location || user.location;

    user.github = github !== undefined ? github : user.github;
    user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;
    user.portfolio = portfolio !== undefined ? portfolio : user.portfolio;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Upload Profile Photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    user.profileImage = `/uploads/${req.file.filename}`;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      profileImage: user.profileImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
    });
  }
};

// Upload Resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.resume = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: user.resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};

// Real user chat system
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select(
      "pinnedChats archivedChats"
    );

    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );

    const pinnedIds = currentUser.pinnedChats.map((id) => id.toString());
    const archivedIds = currentUser.archivedChats.map((id) => id.toString());

    const usersWithChatMeta = users
      .map((user) => ({
        ...user.toObject(),
        isPinned: pinnedIds.includes(user._id.toString()),
        isArchived: archivedIds.includes(user._id.toString()),
      }))
      .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

    res.json({ users: usersWithChatMeta });
  } catch (err) {
    res.status(500).json({ message: "Failed to get users" });
  }
};

// GET SINGLE USER PROFILE
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("skillsOffered")
      .populate("skillsWanted");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// UPDATE LAST SEEN
export const updateLastSeen = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { lastSeen: new Date() },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update last seen",
    });
  }
};

// PIN / UNPIN CHAT
export const togglePinChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user._id);

    const alreadyPinned = user.pinnedChats.some(
      (id) => id.toString() === userId
    );

    if (alreadyPinned) {
      user.pinnedChats = user.pinnedChats.filter(
        (id) => id.toString() !== userId
      );
    } else {
      user.pinnedChats.push(userId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      pinnedChats: user.pinnedChats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle pin chat",
    });
  }
};

// ARCHIVE / UNARCHIVE CHAT
export const toggleArchiveChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(req.user._id);

    const alreadyArchived = user.archivedChats.some(
      (id) => id.toString() === userId
    );

    if (alreadyArchived) {
      user.archivedChats = user.archivedChats.filter(
        (id) => id.toString() !== userId
      );
    } else {
      user.archivedChats.push(userId);
      user.pinnedChats = user.pinnedChats.filter(
        (id) => id.toString() !== userId
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      archivedChats: user.archivedChats,
      pinnedChats: user.pinnedChats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle archive chat",
    });
  }
};