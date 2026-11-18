import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    grade: { type: String, required: true, trim: true, maxlength: 40 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    topic: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    message: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewing", "contacted", "enrolled", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.model("Enquiry", enquirySchema);
