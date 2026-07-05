import Session from "../models/Session.js";
import Availability from "../models/Availability.js";

export const createSession = async (req, res) => {
  try {
    const {
      teacher,
      skill,
      sessionDate,
      duration,
      notes,
      availabilitySlot,
    } = req.body;

    if (!teacher || !skill || !sessionDate || !duration) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    if (availabilitySlot) {
      const slot = await Availability.findOne({
        _id: availabilitySlot,
        teacher,
        isBooked: false,
      });

      if (!slot) {
        return res.status(400).json({
          success: false,
          message: "Selected slot is not available or already booked.",
        });
      }

      slot.isBooked = true;
      await slot.save();
    }

    const session = await Session.create({
      learner: req.user._id,
      teacher,
      skill,
      sessionDate,
      duration,
      notes,
    });

    const populatedSession = await Session.findById(session._id)
      .populate("learner", "fullName profileImage")
      .populate("teacher", "fullName profileImage")
      .populate("skill", "name level");

    res.status(201).json({
      success: true,
      message: "Session booked successfully.",
      session: populatedSession,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { learner: req.user._id },
        { teacher: req.user._id },
      ],
    })
      .populate("learner", "fullName profileImage")
      .populate("teacher", "fullName profileImage")
      .populate("skill", "name level")
      .sort({ sessionDate: 1 });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "Accepted";

    await session.save();

    res.json({
      success: true,
      message: "Session accepted",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "Rejected";

    await session.save();

    res.json({
      success: true,
      message: "Session rejected",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "Cancelled";

    await session.save();

    res.json({
      success: true,
      message: "Session cancelled",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "Completed";

    await session.save();

    res.json({
      success: true,
      message: "Session completed",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};