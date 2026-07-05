import Connection from "../models/Connection.js";
import { createNotification } from "./notificationController.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const { receiver } = req.body;

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { sender: req.user._id, receiver },
        { sender: receiver, receiver: req.user._id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "Connection request already exists",
      });
    }

    const connection = await Connection.create({
      sender: req.user._id,
      receiver,
    });

    const populatedConnection = await Connection.findById(connection._id)
      .populate("sender", "fullName profileImage headline")
      .populate("receiver", "fullName profileImage headline");

    await createNotification({
      user: receiver,
      title: "New Connection Request",
      message: `${populatedConnection.sender.fullName} sent you a connection request`,
      type: "system",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(receiver).emit("connection_notification", {
        type: "new_request",
        message: `${populatedConnection.sender.fullName} sent you a connection request`,
        connection: populatedConnection,
      });
    }

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      connection: populatedConnection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send connection request",
      error: error.message,
    });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "fullName profileImage headline")
      .populate("receiver", "fullName profileImage headline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      connections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch connections",
      error: error.message,
    });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only receiver can accept this request",
      });
    }

    connection.status = "Accepted";
    await connection.save();

    const populatedConnection = await Connection.findById(connection._id)
      .populate("sender", "fullName profileImage headline")
      .populate("receiver", "fullName profileImage headline");

    await createNotification({
      user: connection.sender.toString(),
      title: "Connection Request Accepted",
      message: `${populatedConnection.receiver.fullName} accepted your connection request`,
      type: "system",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(connection.sender.toString()).emit("connection_notification", {
        type: "accepted",
        message: `${populatedConnection.receiver.fullName} accepted your connection request`,
        connection: populatedConnection,
      });
    }

    res.status(200).json({
      success: true,
      message: "Connection request accepted",
      connection: populatedConnection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept connection request",
      error: error.message,
    });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only receiver can reject this request",
      });
    }

    connection.status = "Rejected";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection request rejected",
      connection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject connection request",
      error: error.message,
    });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove connection",
      error: error.message,
    });
  }
};