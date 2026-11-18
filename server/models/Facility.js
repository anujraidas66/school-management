import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    icon: { type: String, required: true, trim: true, maxlength: 8 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    detail: { type: String, required: true, trim: true, maxlength: 100 },
    order: { type: Number, required: true, min: 1, max: 10000 },
  },
  { timestamps: true },
);

facilitySchema.index({ order: 1 });

export default mongoose.model("Facility", facilitySchema);
