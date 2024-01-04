import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Must enter the first name"],
  },
  familyName: {
    type: String,
    required: [true, "Must add family name"],
  },

  idNumber: {
    type: Number,
    required: [true, "Must add id number"],
    unique: [true, "User with given number is in use"],
  },

  cash: {
    type: Number,
    default: 0,
  },

  credit: {
    type: Number,
    default: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model("user", userSchema);

export default User;
