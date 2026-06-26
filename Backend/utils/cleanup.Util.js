import fs from "fs";

export const cleanupTempFiles = (file, outputPath) => {
  const filePaths = [];
  if (file && file.path) {
    filePaths.push(file.path);
  }
  if (outputPath) {
    filePaths.push(outputPath);
  }

  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Temp file cleanup failed:", unlinkErr);
        }
      });
    }
  });
};
