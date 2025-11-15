const express = require('express');
const router = express.Router();
const lessonProgressController = require('../controllers/lessonProgress.controller');
const auth = require('../middleware/auth.middleware');

// All routes require authentication
router.use(auth);

// Get complete progress
router.get('/progress', lessonProgressController.getProgress);

// Get progress statistics
router.get('/progress/stats', lessonProgressController.getProgressStats);

// Get specific lesson progress
router.get('/progress/:lessonId', lessonProgressController.getLessonProgress);

// Mark lesson as viewed
router.post('/progress/:lessonId/view', lessonProgressController.markLessonViewed);

// Mark lesson as completed
router.post('/progress/:lessonId/complete', lessonProgressController.markLessonCompleted);

// Reset progress (for testing)
router.delete('/progress/reset', lessonProgressController.resetProgress);

module.exports = router;

