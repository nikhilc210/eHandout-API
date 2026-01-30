import mongoose from "mongoose";

const studentTutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const StudentTutorial = mongoose.model(
  "StudentTutorial",
  studentTutorialSchema,
  "studentTutorial",
);

export default StudentTutorial;
