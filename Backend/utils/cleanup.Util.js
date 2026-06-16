import fs from "fs";

export const cleanupTempFiles = (file, outputPath) => {
  [file.path, outputPath].forEach((filePath) => {
    if (!filePath) return;

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Temp file cleanup failed:", unlinkErr);
      }
    });
  });
};
