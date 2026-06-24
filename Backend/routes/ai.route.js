import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { createSummary, chat } from "../controller/ai.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router
  .route("/createSummary")
  .post(verifyJwt, upload.single("file"), createSummary);

router
  .route("/chat")
  .post(verifyJwt, chat);

export default router;
