import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "JsonWebToken";

const userSchema = new mongoose.Schema(
  {
    usernamea: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "required password"],
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File.model",
      },
    ],
    pfp: {
      type: String,
      dafault: "",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPassCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this.id,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.A_T_EXPIRY },
  );
};

export const User = mongoose.model("User", userSchema);
