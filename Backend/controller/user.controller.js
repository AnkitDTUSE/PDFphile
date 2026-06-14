import { asyncHandler } from "../utils/asyncHandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { apiResponse } from "../utils/apiResponse.util.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { upload } from "../middleware/multer.middleware.js";
import { User } from "../models/user.model.js";
import { File } from "../models/file.model.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefershToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Token Generation Error Details:", err);
    throw new apiError(500, "something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((feild) => feild.trim() === "")
  ) {
    throw new apiError(400, "all feilds are mandate");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) throw new apiError(401, "user already exists, try to login");

  await User.create({
    fullName,
    username,
    email,
    password,
  });

  const createdUser = await User.findOne({
    $or: [{ username }, { email }],
  }).select("-password -refreshToken");

  return res
    .status(201)
    .json(
      new apiResponse(
        200,
        { user: createdUser },
        "user registered successfully",
      ),
    );
});

const loginHandler = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email))
    throw new apiError(400, "username and email are required");
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) throw new apiError(401, "user not found");

  const isPassValid = await user.isPasswordCorrect(password);

  if (!isPassValid) throw new apiError(400, "incorrect password");

  const { accessToken, refreshToken } = await generateAccessAndRefershToken(
    user._id,
  );


  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "loggedIn Successful",
      ),
    );
});

const logoutHandler = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { returnDocument: "after" },
  );

  return res
    .status(200)
    .clearCookie("accessToken".options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "Logout successful"));
});

export { loginHandler, registerUser, logoutHandler };
