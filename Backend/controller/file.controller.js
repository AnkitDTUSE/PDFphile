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
const execAsync = promisify(exec);

const convertDocx = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new apiError(400, "upload a file for converison");

  const ext = ".pdf";
  const inputPath = path.resolve(req.file.path);
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
  const file = req.file;
  const inputPath = file ? path.resolve(file.path) : null;

  if (file) {
    htmlContent = fs.readFileSync(inputPath, "utf-8");
  } else if (req.body.html) {
    htmlContent = req.body.html;
  } else {
    throw new apiError(400, "HTML Content is required to convert");
  }
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${req.file ? path.parse(req.file.originalname).name : `html-${Date.now()}`}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  await fsPromises.mkdir(outputDir, { recursive: true });

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pageSize = req.body.pageSize || "A4";
    const orientation = req.body.orientation || "portrait";
    const marginSize = req.body.marginSize || "20mm";

    await page.pdf({
      path: outputPath,
      format: pageSize,
      landscape: orientation === "landscape",
      printBackground: true,
      margin: {
        top: marginSize,
        bottom: marginSize,
        left: marginSize,
        right: marginSize,
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
    throw new apiError(500, `error while converting HTML file ${err}`);
  }
});

const convertDrawio = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "Upload a file to convert");

  const inputPath = path.resolve(req.file.path);
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  await fsPromises.mkdir(outputDir, { recursive: true });

  const cmd = `xvfb-run -a drawio -x -f pdf --all-pages -o "${outputPath}" "${inputPath}" --no-sandbox`;

  try {
    const { stdout, stderr } = await execAsync(cmd);
    
    if (!fs.existsSync(outputPath)) {
      throw new Error(`Output file was not generated. Stderr: ${stderr || "none"}`);
    }

    res.download(outputPath, (err) => {
      if (err) {
        console.error("PDF conversion failed", err);
      }
      cleanupTempFiles(file, outputPath);
    });
  } catch (err) {
    cleanupTempFiles(file, outputPath);
    throw new apiError(
      500,
      `error while converting Drawio file \n cause ${err.name} \n message ${err.message}`
    );
  }
});

const convertMermaid = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "Upload a file to convert");

  const inputPath = path.resolve(req.file.path);
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputFileName = `${path.parse(req.file.originalname).name}.pdf`;
  const outputPath = path.join(outputDir, outputFileName);

  await fsPromises.mkdir(outputDir, { recursive: true });

  const pageSize = req.body.pageSize || "A4";
  const orientation = req.body.orientation || "portrait";

  let width = 595;
  let height = 842;

  if (pageSize.toLowerCase() === "letter") {
    width = 612;
    height = 792;
  } else if (pageSize.toLowerCase() === "legal") {
    width = 612;
    height = 1008;
  }

  if (orientation === "landscape") {
    const temp = width;
    width = height;
    height = temp;
  }

  const cmd = `mmdc -i "${inputPath}" -o "${outputPath}" -e pdf -w ${width} -H ${height} -p /app/puppeteer-config.json`;
  
  try {
    const { stdout, stderr } = await execAsync(cmd);

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Output file was not generated. Stderr: ${stderr || "none"}`);
    }

    res.download(outputPath, (err) => {
      if (err) {
        console.error("mermaid to PDF conversion Failed", err);
      }
      cleanupTempFiles(file, outputPath);
    });
  } catch (err) {
    cleanupTempFiles(file, outputPath);
    throw new apiError(500, `error while converting mermaid to pdf: ${err.message}`);
  }
});

const convertMarkdown = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "Upload a file to convert");

  const inputPath = path.resolve(file.path);
  const outputDir = path.join(os.homedir(), "Downloads");
  const outputPath = path.join(
    outputDir,
    `${path.parse(file.originalname).name}.pdf`,
  );

  await fsPromises.mkdir(outputDir, { recursive: true });

  try {
    const mdContent = fs.readFileSync(inputPath, "utf-8");

    const pageSize = req.body.pageSize || "A4";
    const orientation = req.body.orientation || "portrait";
    const marginSize = req.body.marginSize || "20mm";

    const options = {
      launch_options: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-zygote",
          "--single-process",
        ],
      },
      pdf_options: {
        format: pageSize,
        landscape: orientation === "landscape",
        margin: {
          top: marginSize,
          right: marginSize,
          bottom: marginSize,
          left: marginSize,
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
