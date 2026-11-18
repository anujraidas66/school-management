import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true, maxlength: 300 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, required: true, trim: true, maxlength: 254 },
    officeHours: { type: String, required: true, trim: true, maxlength: 300 },
    campusName: { type: String, required: true, trim: true, maxlength: 100 },
    campusDescription: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

export default mongoose.model("Contact", contactSchema);
