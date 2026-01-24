import mongoose from "mongoose";

const academicDisciplineSchema = new mongoose.Schema(
  {
    disciplineId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
  },
  { timestamps: true },
);

const AcademicDiscipline = mongoose.model(
  "AcademicDiscipline",
  academicDisciplineSchema,
  "acedemicDisciplines", // Explicitly set collection name (note: acedemicDisciplines with typo)
);

export { AcademicDiscipline };
