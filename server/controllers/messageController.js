import Message from "../models/message.js";

// ==========================
// SEND MESSAGE
// ==========================
export const sendMessage = async (req, res) => {
  try {
    const { receiver, message, image, audio, file, replyTo } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver,
      message,
      image: image || "",
      audio: audio || "",
      file: file || {
        url: "",
        name: "",
        type: "",
        size: 0,
      },
      replyTo: replyTo || null,
      status: "sent",
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "replyTo",
      "message image audio file sender createdAt"
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// ==========================
// GET CHAT BETWEEN TWO USERS
// ==========================
export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    })
      .populate("replyTo", "message image audio file sender createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// ==========================
// UPDATE MESSAGE / EDIT MESSAGE
// ==========================
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const existingMessage = await Message.findById(id);

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (existingMessage.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own message",
      });
    }

    existingMessage.message = message.trim();
    existingMessage.isEdited = true;
    existingMessage.editedAt = new Date();

    await existingMessage.save();

    const updatedMessage = await Message.findById(id).populate(
      "replyTo",
      "message image audio file sender createdAt"
    );

    res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update message",
      error: error.message,
    });
  }
};

// ==========================
// DELETE MESSAGE
// ==========================
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const existingMessage = await Message.findById(id);

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (existingMessage.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own message",
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      deletedMessageId: id,
      receiverId: existingMessage.receiver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

// ==========================
// ADD / UPDATE MESSAGE REACTION
// ==========================
export const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const existingMessage = await Message.findById(id);

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const alreadyReactedIndex = existingMessage.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user._id.toString()
    );

    if (alreadyReactedIndex !== -1) {
      if (existingMessage.reactions[alreadyReactedIndex].emoji === emoji) {
        existingMessage.reactions.splice(alreadyReactedIndex, 1);
      } else {
        existingMessage.reactions[alreadyReactedIndex].emoji = emoji;
      }
    } else {
      existingMessage.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await existingMessage.save();

    const updatedMessage = await Message.findById(id).populate(
      "replyTo",
      "message image audio file sender createdAt"
    );

    res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to react to message",
      error: error.message,
    });
  }
};

// ==========================
// MARK AS DELIVERED
// ==========================
export const markDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, {
      status: "delivered",
      deliveredAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Marked as delivered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update delivered status",
    });
  }
};

// ==========================
// MARK AS SEEN
// ==========================
export const markSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, {
      status: "seen",
      seenAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update seen status",
    });
  }
};

// ==========================
// MARK ALL MESSAGES AS SEEN
// ==========================
export const markMessagesAsSeen = async (req, res) => {
  try {
    const senderId = req.params.senderId;

    const updated = await Message.updateMany(
      {
        sender: senderId,
        receiver: req.user._id,
        status: { $ne: "seen" },
      },
      {
        $set: {
          status: "seen",
          seenAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
      updatedCount: updated.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as seen",
      error: error.message,
    });
  }
};

// ==========================
// CLEAR CHAT
// ==========================
export const clearChat = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Message.deleteMany({
      $or: [
        {
          sender: req.user._id,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: req.user._id,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Chat cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear chat",
      error: error.message,
    });
  }
};