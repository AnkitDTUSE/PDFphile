import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.util.js";
import { apiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new apiError(401, "Unauthourized request");

    const tokenDets = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(tokenDets?._id).select(
      "-password -refreshToken",
    );

    if (!user) throw new apiError(401, "invalid access token");

    req.user = user;
    next();
  } catch (err) {
    throw new apiError(401, err?.message || "invalid user");
  }
});
