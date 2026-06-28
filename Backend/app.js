import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import fileRouter from "./routes/file.route.js";
import aiRouter from "./routes/ai.route.js";
import { apiError } from "./utils/apiError.util.js";

const app = express();

const allowedOrigins = [
  "https://pdfphile.onrender.com",
  "https://pdfphile-v1.onrender.com",
  "https://pdfphile-1.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const envOrigin = process.env.ORIGIN;
      if (
        envOrigin === "*" ||
        (envOrigin && envOrigin.split(",").map(o => o.trim()).indexOf(origin) !== -1) ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        callback(new apiError(300, "Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

//user rotue
app.use("/api/v1/user", userRouter);

//file route
app.use("/api/v1/file", fileRouter);

//ai route
app.use("/api/v1/ai", aiRouter);

export { app };
