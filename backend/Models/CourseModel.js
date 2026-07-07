const mongoose = require("mongoose");
const Schema = mongoose.Schema;

 
const ContentBlockSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    codeExample: {
      type: String,
      default: "",
    },
    objectives: {
      type: [String],
      default: [],
    },
    keyTopics: {
      type: [String],
      default: [],
    },
    readings: {
      type: [
        {
          title: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
      default: [],
    },
    quiz: {
      type: [
        {
          question: { type: String, default: "" },
          options: { type: [String], default: [] },
          answer: { type: String, default: "" },
          explanation: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const ChapterSchema = new Schema(
  {
    chapterName: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: [ContentBlockSchema],
      default: [],
    },  
    videos: {
      type: [String],
      default: [],
    },  
  },
  { _id: false }
);

 
const CourseOutputSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, 
      required: true, 
      trim: true 
    },
    category: { 
      type: String, 
      required: true, 
      trim: true 
    },
    topic: { 
      type: String, 
      required: true, 
      trim: true 
    },
    level: { 
      type: String, 
      required: true, 
      trim: true 
    },
    totalDurationSummary: { 
      type: String, 
      required: true, 
      trim: true 
    },
    totalDurationSpecific: { 
      type: String, 
      required: true, 
      trim: true 
    },

    chapters: [ChapterSchema],  
  },
  { _id: false }
);

const CourseSchema = new Schema({
  courseId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true 
  },
  level: { 
    type: String, 
    required: true, 
    trim: true 
  },
  includeVideo: { 
    type: Boolean, 
    required: true, 
    default: true 
  },
  courseOutput: {
    type: CourseOutputSchema,
    required: true,
  },
  createdBy: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true,
    index: true
  },
  userName: { 
    type: String, 
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const CourseModel = mongoose.model("courses", CourseSchema);
module.exports = CourseModel;
