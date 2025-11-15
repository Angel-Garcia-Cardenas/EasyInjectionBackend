const express = require('express');
const auth = require('../middleware/auth.middleware');
const { User } = require('../../models/user/user.model');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('activeSessions');
    res.json(user.activeSessions);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/close-all', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { activeSessions: [] });
    res.json({ message: 'Todas las sesiones han sido cerradas' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:sessionId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { activeSessions: { _id: req.params.sessionId } }
    });
    res.json({ message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;