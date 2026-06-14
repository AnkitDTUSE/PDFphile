import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { convertDocx, convertHtml } from "../controller/file.controller.js";

const router = Router();

router.route("/convertDocx").post(upload.single("file"), convertDocx);

router.route("/convertHtml").post(upload.single("file"), convertHtml);
export default router;
