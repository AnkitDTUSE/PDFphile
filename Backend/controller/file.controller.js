import { asyncHandler } from "../utils/asyncHandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { apiResponse } from "../utils/apiResponse.util.js";
import { User } from "../models/user.model.js";
import { File } from "../models/file.model.js";
import { upload } from "../middleware/multer.middleware.js";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import docxConverter from "docx-pdf";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanupTempFiles = (file, outputPath) => {
  [file.path, outputPath].forEach((filePath) => {
    if (!filePath) return;

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Temp file cleanup failed:", unlinkErr);
      }
    });
  });
};

const convertDocx = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new apiError(400, "upload a file for converison");

  const outputDir = os.homedir();
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, "Downloads", outputFileName);

  docxConverter(req.file.path, outputPath, (err, result) => {
    if (err) {
      cleanupTempFiles(file, outputPath);
      console.error(err);
      return res
        .status(500)
        .json(new apiResponse(500, {}, "PDF conversion failed"));
    }

    res.download(outputPath, (downloadErr) => {
      if (downloadErr) {
        console.error(downloadErr);
      }
      cleanupTempFiles(file, outputPath);
      console.log("file is downloading");
    });
    console.log("result" + result);
  });
});

export { convertDocx };
