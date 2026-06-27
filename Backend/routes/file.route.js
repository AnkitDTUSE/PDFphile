import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  convertDocx,
  convertDrawio,
  convertHtml,
  convertMarkdown,
  convertMermaid,
} from "../controller/file.controller.js";

const router = Router();

router.route("/convertDocx").post(upload.single("file"), convertDocx);

router.route("/convertHtml").post(upload.single("file"), convertHtml);

router.route("/convertDrawio").post(upload.single("file"), convertDrawio);

router.route("/convertMermaid").post(upload.single("file"), convertMermaid);

router.route("/convertMarkdown").post(upload.single("file"), convertMarkdown);
export default router;

