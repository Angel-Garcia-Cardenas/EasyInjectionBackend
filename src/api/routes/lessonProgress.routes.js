const express = require('express');
const router = express.Router();
const lessonProgressController = require('../controllers/lessonProgress.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/progress', lessonProgressController.getProgress);
router.get('/progress/:lessonId', lessonProgressController.getLessonProgress);
router.post('/progress/:lessonId/start', lessonProgressController.markLessonStarted);
router.post('/progress/:lessonId/complete', lessonProgressController.markLessonComplete);

module.exports = router;
