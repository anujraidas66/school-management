import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, enum: ["academics", "sports", "arts", "events"] },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    colorOne: { type: String, required: true, trim: true, maxlength: 20 },
    colorTwo: { type: String, required: true, trim: true, maxlength: 20 },
    imageUrl: { type: String, trim: true, maxlength: 500, default: "" },
    order: { type: Number, required: true, min: 1, max: 10000 },
  },
  { timestamps: true },
);

gallerySchema.index({ order: 1 });

export default mongoose.model("Gallery", gallerySchema);
