const mongoose = require('mongoose');

// Individual lesson progress entry
const lessonEntrySchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'viewed', 'completed'],
    default: 'not_started'
  },
  firstViewedAt: {
    type: Date,
    default: null
  },
  lastViewedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Main lesson progress schema
const lessonProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  lessons: {
    type: [lessonEntrySchema],
    default: []
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
lessonProgressSchema.index({ userId: 1 });

// Static method: Get user's progress
lessonProgressSchema.statics.getUserProgress = async function(userId) {
  let progress = await this.findOne({ userId });
  
  // Create if doesn't exist
  if (!progress) {
    progress = await this.create({ userId, lessons: [] });
  }
  
  return progress;
};

// Static method: Mark lesson as viewed
lessonProgressSchema.statics.markLessonViewed = async function(userId, lessonId) {
  let progress = await this.findOne({ userId });
  
  if (!progress) {
    progress = await this.create({ userId, lessons: [] });
  }
  
  const lessonIndex = progress.lessons.findIndex(l => l.lessonId === lessonId);
  const now = new Date();
  
  if (lessonIndex === -1) {
    // New lesson - add it
    progress.lessons.push({
      lessonId,
      status: 'viewed',
      firstViewedAt: now,
      lastViewedAt: now,
      viewCount: 1
    });
  } else {
    // Existing lesson - update
    const lesson = progress.lessons[lessonIndex];
    if (!lesson.firstViewedAt) {
      lesson.firstViewedAt = now;
    }
    lesson.lastViewedAt = now;
    lesson.viewCount = (lesson.viewCount || 0) + 1;
    
    // Only update status to viewed if not already completed
    if (lesson.status === 'not_started') {
      lesson.status = 'viewed';
    }
  }
  
  progress.lastActivity = now;
  await progress.save();
  
  return progress;
};

// Static method: Mark lesson as completed
lessonProgressSchema.statics.markLessonCompleted = async function(userId, lessonId) {
  let progress = await this.findOne({ userId });
  
  if (!progress) {
    progress = await this.create({ userId, lessons: [] });
  }
  
  const lessonIndex = progress.lessons.findIndex(l => l.lessonId === lessonId);
  const now = new Date();
  
  if (lessonIndex === -1) {
    // New lesson - add as completed
    progress.lessons.push({
      lessonId,
      status: 'completed',
      firstViewedAt: now,
      lastViewedAt: now,
      completedAt: now,
      viewCount: 1
    });
  } else {
    // Existing lesson - mark as completed
    const lesson = progress.lessons[lessonIndex];
    lesson.status = 'completed';
    lesson.completedAt = now;
    lesson.lastViewedAt = now;
    
    if (!lesson.firstViewedAt) {
      lesson.firstViewedAt = now;
    }
  }
  
  progress.lastActivity = now;
  await progress.save();
  
  return progress;
};

// Static method: Get progress statistics
lessonProgressSchema.statics.getProgressStats = async function(userId, lessonIds = null) {
  const progress = await this.getUserProgress(userId);
  
  let lessonsToCheck = progress.lessons;
  
  // Filter by specific lesson IDs if provided
  if (lessonIds && Array.isArray(lessonIds)) {
    lessonsToCheck = progress.lessons.filter(l => lessonIds.includes(l.lessonId));
  }
  
  const viewed = lessonsToCheck.filter(l => l.status === 'viewed').map(l => l.lessonId);
  const completed = lessonsToCheck.filter(l => l.status === 'completed').map(l => l.lessonId);
  const notStarted = lessonIds 
    ? lessonIds.filter(id => !lessonsToCheck.find(l => l.lessonId === id))
    : [];
  
  return {
    viewedLessons: viewed,
    completedLessons: completed,
    notStartedLessons: notStarted,
    viewedCount: viewed.length,
    completedCount: completed.length,
    notStartedCount: notStarted.length,
    totalLessons: lessonIds ? lessonIds.length : lessonsToCheck.length,
    hasStartedAny: lessonsToCheck.length > 0,
    lastActivity: progress.lastActivity
  };
};

// Static method: Get detailed lesson info
lessonProgressSchema.statics.getLessonDetails = async function(userId, lessonId) {
  const progress = await this.getUserProgress(userId);
  const lesson = progress.lessons.find(l => l.lessonId === lessonId);
  
  if (!lesson) {
    return {
      lessonId,
      status: 'not_started',
      firstViewedAt: null,
      lastViewedAt: null,
      completedAt: null,
      viewCount: 0
    };
  }
  
  return lesson;
};

const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);

module.exports = LessonProgress;

