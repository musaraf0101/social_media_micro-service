import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("db connected successfully");
    logger.info("db connected success");
  } catch (error) {
    console.log(error.message);
    logger.error("mongo connect error", error.message);
    process.exit(1);
  }
};
