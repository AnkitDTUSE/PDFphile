import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { convertDocx } from "../controller/file.controller.js";

const router = Router();

router.route("/convertDocx").post(upload.single("file"), convertDocx);

export default router;
