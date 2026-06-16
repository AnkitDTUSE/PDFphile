import { asyncHandler } from "../utils/asyncHandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { apiResponse } from "../utils/apiResponse.util.js";
import { User } from "../models/user.model.js";
import { File } from "../models/file.model.js";
import { upload } from "../middleware/multer.middleware.js";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import libre from "libreoffice-convert";
import { promisify } from "util";
import fs from "fs";
import puppeteer from "puppeteer";
import { mdToPdf } from "md-to-pdf";
import { exec } from "child_process";
import { stderr, stdout } from "process";
import { cleanupTempFiles } from "../utils/cleanup.Util.js";

libre.convertAsync = promisify(libre.convert);
const fsPromises = fs.promises;

const convertDocx = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new apiError(400, "upload a file for converison");

  const ext = ".pdf";
  const inputPath = req.file.path;
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  await fsPromises.mkdir(outputDir, { recursive: true });

  const docxBuf = await fsPromises.readFile(inputPath);
  const pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);

  await fsPromises.writeFile(outputPath, pdfBuf);

  res.download(outputPath, (err) => {
    if (err) {
      console.error("PDF conversion failed", err);
    }
    cleanupTempFiles(file, outputPath);
  });
});

const convertHtml = asyncHandler(async (req, res) => {
  let htmlContent = "";
  const inputPath = req.file?.path;
  const file = req.file;

  if (file) {
    htmlContent = fs.readFileSync(inputPath, "utf-8");
  } else if (req.body.html) {
    htmlContent = req.body.html;
  } else {
    throw new apiError(400, "HTML Content is required to convert");
  }
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    await browser.close();

    res.download(outputPath, (err) => {
      if (err) {
        console.error("PDF conversion failed", err);
      }
      cleanupTempFiles(file, outputPath);
    });
  } catch (err) {
    if (browser) await browser.close();
    cleanupTempFiles(file, outputPath);
    throw new apiError(500, "error while converting HTML file");
  }
});

const convertDrawio = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "Upload a file to convert");

  const inputPath = req.file?.path;
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  const cmd = `drawio -x -f pdf --page-format A4 --all-pages -o "${outputPath}" "${inputPath}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      cleanupTempFiles(file, outputPath);
      throw new apiError(500, "error while converting Drawio file");
    }

    res.download(outputPath, (err) => {
      if (err) {
        console.error("PDF conversion failed", err);
      }
      cleanupTempFiles(file, outputPath);
    });
  });
});

const convertMermaid = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "Upload a file to convert");

  const inputPath = req.file?.path;
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  const cmd = `mmdc -i "${inputPath}" -o "${outputPath}" -e pdf -w 595 -H 842 `;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      cleanupTempFiles(file, outputPath);
      throw new apiError(500, "error while converting mermaid to pdf");
    }

    res.download(outputPath, (err) => {
      if (err) {
        console.error("mermaid to PDF conversion Failed", err);
      }

      cleanupTempFiles(file, outputPath);
    });
  });
});

const convertMarkdown = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "Upload a file to convert");

  const inputPath = file.path;
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputPath = path.join(
    outputDir,
    `${path.parse(file.originalname).name}.pdf`,
  );

  try {
    const mdContent = fs.readFileSync(inputPath, "utf-8");

    const options = {
      pdf_options: {
        format: "A4",
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
        printBackground: true, // Ensures background colors for standard code blocks render correctly
      },
    };

    const pdfBuffer = await mdToPdf({ content: mdContent }, options);

    fs.writeFileSync(outputPath, pdfBuffer.content);

    res.download(outputPath, (err) => {
      if (err) {
        console.error("markdown to PDF conversion failed", err);
      }
      cleanupTempFiles(file, outputPath);
    });
  } catch (err) {
    cleanupTempFiles(file, outputPath);
    console.error("error wile converting markdown to pdf");
    throw new apiError(500, "error while converting md to pdf");
  }
});
export {
  convertDocx,
  convertHtml,
  convertDrawio,
  convertMermaid,
  convertMarkdown,
};
