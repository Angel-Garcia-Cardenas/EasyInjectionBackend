const express = require("express");
const auth = require("../middleware/auth.middleware");
const { Notification } = require("../../models/user/notification.model");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user_id: req.user._id, 
      read: false 
    });
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ 
      _id: req.params.id, 
      user_id: req.user._id 
    });
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;