import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

},
{
  timestamps: true
}
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;