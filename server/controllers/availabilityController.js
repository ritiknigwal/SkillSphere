import Availability from "../models/Availability.js";

export const createAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Date, start time and end time are required",
      });
    }

    const availability = await Availability.create({
      teacher: req.user._id,
      date,
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      message: "Availability added successfully",
      availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add availability",
      error: error.message,
    });
  }
};

export const getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      teacher: req.user._id,
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
      error: error.message,
    });
  }
};

export const getTeacherAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      teacher: req.params.teacherId,
      isBooked: false,
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher availability",
      error: error.message,
    });
  }
};

export const deleteAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user._id,
      isBooked: false,
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found or already booked",
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete availability",
      error: error.message,
    });
  }
};