import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { DBConnection } from "./config/db.js";
import Postroute from "./routes/post.routes.js";

dotenv.config();

DBConnection;
const app = express();
const PORT = process.env.PORT || 3002;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recived ${req.method} request tp ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();
});

app.use(errorHandler);

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  Postroute,
);

app.listen(PORT, () => {
  logger.info(`post service running on port ${PORT}`);
});
