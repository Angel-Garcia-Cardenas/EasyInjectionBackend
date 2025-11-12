const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User } = require("../../models/user/user.model");
const emailService = require("../../services/email.service");
const router = express.Router();

router.post("/request", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No existe una cuenta con ese correo electrónico" });
    }
  } catch (err) {
    console.error("Password reset  request error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/reset/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "El token es inválido o ha expirado" });
    }

    const salt = await bcrypt.genSalt(10);
    user.contrasena_hash = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Tu contraseña ha sido restablecida exitosamente" });
  } catch (err) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;