import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { logger } from "./utils/logger.js";
import { DBConnection } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/indentity-service.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

DBConnection();

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recived ${req.method} request tp ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();
});

// ddos protection
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many request",
      });
    });
});

// ip based rate limiting

const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sentive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many request",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/api/auth/register", sensitiveEndpointsLimiter);
app.use(errorHandler);

app.use("/api/auth", router);

app.listen(PORT, () => {
  logger.info(`indentity service running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, Promise) => {
  logger.error(`unhandled rejection at`, Promise, "reason:", reason);
});
