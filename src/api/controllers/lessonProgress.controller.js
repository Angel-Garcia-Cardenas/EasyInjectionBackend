const LessonProgress = require('../../models/lessonProgress.model');

exports.getProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await LessonProgress.getProgressStats(userId);

        res.status(200).json({
            success: true,
            data: {
                completedLessons: stats.completedLessons,
                completedCount: stats.completedCount,
                lastCompletedAt: stats.lastCompletedAt,
                startedLessons: stats.startedLessons,
                startedCount: stats.startedCount,
                hasStartedAny: stats.hasStartedAny
            }
        });
    } catch (error) {
        console.error('Error getting lesson progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el progreso de las lecciones'
        });
    }
};

exports.markLessonComplete = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la lección es requerido'
            });
        }

        const progress = await LessonProgress.markLessonComplete(userId, lessonId);

        console.log(`User ${userId} completed lesson ${lessonId}`);

        res.status(200).json({
            success: true,
            data: {
                lessonId: progress.lessonId,
                completed: progress.completed,
                completedAt: progress.completedAt
            },
            message: 'Lección completada exitosamente'
        });
    } catch (error) {
        console.error('Error marking lesson as complete:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar la lección como completada'
        });
    }
};

exports.markLessonStarted = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la lección es requerido'
            });
        }

        const progress = await LessonProgress.markLessonStarted(userId, lessonId);

        console.log(`User ${userId} started lesson ${lessonId}`);

        res.status(200).json({
            success: true,
            data: {
                lessonId: progress.lessonId,
                started: progress.started,
                startedAt: progress.startedAt
            },
            message: 'Lección marcada como iniciada'
        });
    } catch (error) {
        console.error('Error marking lesson as started:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar la lección como iniciada'
        });
    }
};

exports.getLessonProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { lessonId } = req.params;

        const progress = await LessonProgress.findOne({ userId, lessonId });

        res.status(200).json({
            success: true,
            data: {
                lessonId,
                completed: progress ? progress.completed : false,
                completedAt: progress ? progress.completedAt : null
            }
        });
    } catch (error) {
        console.error('Error getting lesson progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el progreso de la lección'
        });
    }
};
