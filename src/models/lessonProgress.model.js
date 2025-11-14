const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    lessonId: {
        type: String,
        required: true,
        index: true
    },
    started: {
        type: Boolean,
        default: false
    },
    startedAt: {
        type: Date,
        default: null
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

lessonProgressSchema.statics.getCompletedLessons = async function(userId) {
    const progress = await this.find({ userId, completed: true })
        .select('lessonId completedAt')
        .sort({ completedAt: -1 });

    return progress.map(p => p.lessonId);
};

lessonProgressSchema.statics.markLessonComplete = async function(userId, lessonId) {
    const result = await this.findOneAndUpdate(
        { userId, lessonId },
        {
            completed: true,
            completedAt: new Date()
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    return result;
};

lessonProgressSchema.statics.markLessonStarted = async function(userId, lessonId) {
    const result = await this.findOneAndUpdate(
        { userId, lessonId },
        {
            $setOnInsert: {
                started: true,
                startedAt: new Date(),
                completed: false
            }
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    if (!result.started) {
        result.started = true;
        result.startedAt = result.startedAt || new Date();
        await result.save();
    }

    return result;
};

lessonProgressSchema.statics.getProgressStats = async function(userId) {
    const completedCount = await this.countDocuments({ userId, completed: true });
    const startedCount = await this.countDocuments({ userId, started: true });

    const completedProgress = await this.find({ userId, completed: true })
        .select('lessonId completedAt')
        .sort({ completedAt: -1 });

    const startedProgress = await this.find({ userId, started: true })
        .select('lessonId startedAt')
        .sort({ startedAt: -1 });

    return {
        completedCount,
        completedLessons: completedProgress.map(p => p.lessonId),
        lastCompletedAt: completedProgress.length > 0 ? completedProgress[0].completedAt : null,
        startedCount,
        startedLessons: startedProgress.map(p => p.lessonId),
        hasStartedAny: startedCount > 0
    };
};

const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);

module.exports = LessonProgress;
