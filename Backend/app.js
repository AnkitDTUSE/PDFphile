import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import fileRouter from "./routes/file.route.js";
import aiRouter from "./routes/ai.route.js";

const app = express();

app.use(
  cors({
    origin: "*",
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
