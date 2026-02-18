import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import proxy from "express-http-proxy";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

const ratelimitOptions = rateLimit({
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

app.use(ratelimitOptions);

app.use((req, res, next) => {
  logger.info(`Recived ${req.method} request tp ${req.url}`);
  logger.info(`Request body ${req.body}`);
  next();
});

// proxy

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  },
};

// setting up proxy for identity service

app.use(
  "/v1/auth",
  proxy(process.env.INDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, SrcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response recived from identity service: ${proxyRes.statusCode}`,
      );
      return proxyResData;
    },
  }),
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.INDENTITY_SERVICE_URL}`,
  );
  logger.info(`Redis url ${process.env.REDIS_URL}`);
});
