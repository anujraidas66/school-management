import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    grades: { type: String, required: true, trim: true, maxlength: 60 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    order: { type: Number, required: true, min: 1, max: 10000 },
  },
  { timestamps: true },
);

programSchema.index({ order: 1 });

export default mongoose.model("Program", programSchema);
