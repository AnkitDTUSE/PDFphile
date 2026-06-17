import { asyncHandler } from "../utils/asyncHandler.util.js";
import { apiError } from "../utils/apiError.util.js";
import { apiResponse } from "../utils/apiResponse.util.js";
import { cleanupTempFiles } from "../utils/cleanup.Util.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

const createSummary = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) throw new apiError(400, "upload file to summarise");

  if (file.mimetype !== "application/pdf") {
    cleanupTempFiles(file, null);
    throw new apiError(400, "please upload only PDF");
  }
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const pdfPart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    };

    const prompt = `You are an expert document analyst. Analyze the attached PDF document and provide a comprehensive summary.
      Structure your response beautifully using Markdown with the following sections:
      - **Executive Overview**: A high-level 2-3 sentence summary of the document.
      - **Key Core Concepts**: A bulleted list of the primary topics, findings, or arguments discussed.
      - **Critical Takeaways/Action Items**: What are the most important conclusions or takeaways?
      Ensure the tone is professional, clear, and objective.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [pdfPart, prompt],
    });

    const summaryText = response.text;

    cleanupTempFiles(file, null);

    return res
      .status(200)
      .json(
        new apiResponse(200, { summary: summaryText }, "summary generated"),
      );
  } catch (err) {
    cleanupTempFiles(file, null);
    console.error("gemini processing pipeple error:", err);
    throw new apiError(
      500,
      err?.message ||
        "The AI model failed to process and summarize the document.",
    );
  }
});

export { createSummary };
