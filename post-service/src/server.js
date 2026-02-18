import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recived ${req.method} request tp ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();
});

app.listen(PORT, () => {
  logger.info(`post service running on port ${PORT}`);
});
