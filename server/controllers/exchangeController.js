import Exchange from "../models/Exchange.js";
import { createNotification } from "./notificationController.js";

export const sendExchangeRequest = async (req, res) => {
  try {
    const { receiver, offeredSkill, wantedSkill, message } = req.body;

    if (!receiver || !offeredSkill || !wantedSkill) {
      return res.status(400).json({
        success: false,
        message: "Receiver, offered skill and wanted skill are required",
      });
    }

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send request to yourself",
      });
    }

    const duplicate = await Exchange.findOne({
      requester: req.user._id,
      receiver,
      offeredSkill,
      wantedSkill,
      status: "pending",
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "You already sent this exchange request",
      });
    }

    const exchange = await Exchange.create({
      requester: req.user._id,
      receiver,
      offeredSkill,
      wantedSkill,
      message: message || "",
    });

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate("requester", "fullName email profileImage headline")
      .populate("receiver", "fullName email profileImage headline");

    await createNotification({
      user: receiver,
      title: "New Exchange Request",
      message: `${populatedExchange.requester.fullName} sent you a skill exchange request`,
      type: "skill",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(receiver).emit("exchange_notification", {
        type: "new_request",
        message: `${populatedExchange.requester.fullName} sent you a skill exchange request`,
        exchange: populatedExchange,
      });
    }

    res.status(201).json({
      success: true,
      message: "Exchange request sent successfully",
      exchange: populatedExchange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send exchange request",
      error: error.message,
    });
  }
};

export const getMyExchangeRequests = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
    })
      .populate("requester", "fullName email profileImage headline")
      .populate("receiver", "fullName email profileImage headline")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      exchanges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch exchanges",
      error: error.message,
    });
  }
};

export const acceptExchangeRequest = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    if (exchange.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only receiver can accept this request",
      });
    }

    exchange.status = "accepted";
    await exchange.save();

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate("requester", "fullName email profileImage headline")
      .populate("receiver", "fullName email profileImage headline");

    await createNotification({
      user: exchange.requester.toString(),
      title: "Exchange Request Accepted",
      message: `${populatedExchange.receiver.fullName} accepted your exchange request`,
      type: "skill",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(exchange.requester.toString()).emit("exchange_notification", {
        type: "accepted",
        message: `${populatedExchange.receiver.fullName} accepted your exchange request`,
        exchange: populatedExchange,
      });
    }

    res.status(200).json({
      success: true,
      message: "Exchange request accepted",
      exchange: populatedExchange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept exchange request",
      error: error.message,
    });
  }
};

export const rejectExchangeRequest = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    if (exchange.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only receiver can reject this request",
      });
    }

    exchange.status = "rejected";
    await exchange.save();

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate("requester", "fullName email profileImage headline")
      .populate("receiver", "fullName email profileImage headline");

    await createNotification({
      user: exchange.requester.toString(),
      title: "Exchange Request Rejected",
      message: `${populatedExchange.receiver.fullName} rejected your exchange request`,
      type: "skill",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(exchange.requester.toString()).emit("exchange_notification", {
        type: "rejected",
        message: `${populatedExchange.receiver.fullName} rejected your exchange request`,
        exchange: populatedExchange,
      });
    }

    res.status(200).json({
      success: true,
      message: "Exchange request rejected",
      exchange: populatedExchange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject exchange request",
      error: error.message,
    });
  }
};

export const cancelExchangeRequest = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    if (exchange.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only requester can cancel this request",
      });
    }

    exchange.status = "cancelled";
    await exchange.save();

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate("requester", "fullName email profileImage headline")
      .populate("receiver", "fullName email profileImage headline");

    await createNotification({
      user: exchange.receiver.toString(),
      title: "Exchange Request Cancelled",
      message: `${populatedExchange.requester.fullName} cancelled the exchange request`,
      type: "skill",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(exchange.receiver.toString()).emit("exchange_notification", {
        type: "cancelled",
        message: `${populatedExchange.requester.fullName} cancelled the exchange request`,
        exchange: populatedExchange,
      });
    }

    res.status(200).json({
      success: true,
      message: "Exchange request cancelled",
      exchange: populatedExchange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel exchange request",
      error: error.message,
    });
  }
};

export const completeExchangeRequest = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    const isParticipant =
      exchange.requester.toString() === req.user._id.toString() ||
      exchange.receiver.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Only participants can complete this exchange",
      });
    }

    exchange.status = "completed";
    await exchange.save();

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate("requester", "fullName email profileImage headline")
      .populate("receiver", "fullName email profileImage headline");

    const otherUserId =
      exchange.requester.toString() === req.user._id.toString()
        ? exchange.receiver.toString()
        : exchange.requester.toString();

    await createNotification({
      user: otherUserId,
      title: "Exchange Completed",
      message: "An exchange session was marked as completed",
      type: "skill",
    });

    const io = req.app.get("io");

    if (io) {
      io.to(otherUserId).emit("exchange_notification", {
        type: "completed",
        message: "An exchange session was marked as completed",
        exchange: populatedExchange,
      });
    }

    res.status(200).json({
      success: true,
      message: "Exchange completed",
      exchange: populatedExchange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to complete exchange",
      error: error.message,
    });
  }
};