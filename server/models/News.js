import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, trim: true, maxlength: 30 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    order: { type: Number, required: true, min: 1, max: 10000 },
  },
  { timestamps: true },
);

newsSchema.index({ order: 1 });

export default mongoose.model("News", newsSchema);
