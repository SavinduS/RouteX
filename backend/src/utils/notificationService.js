const Notification = require("../models/Notification");

let io;

const initNotification = (serverIo) => {
  io = serverIo;
};

const sendNotification = async (data) => {
  try {
    const notification = new Notification({
      type: data.type,
      message: data.message,
      relatedId: data.relatedId,
      relatedModel: data.relatedModel,
    });
    await notification.save();

    if (io) {
      io.to("admins").emit("new_notification", notification);
    }
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { initNotification, sendNotification };
