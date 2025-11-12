const express = require("express");
const auth = require("../middleware/auth.middleware");
const { Activity } = require("../../models/user/activity.model");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user_id: req.user.id })
      .sort({ date: -1 })
      .limit(10);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    const activity = await Activity.findOne(
      { _id: req.params.id, user_id: req.user.id },
      { read: true },
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    activity.read = true;
    await activity.save();
    res.json({ message: "Actividad marcada como leída" });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
