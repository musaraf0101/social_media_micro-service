import { logger } from "./../utils/logger.js";
import { validateLogin, validateRegistration } from "./../utils/validation.js";
import { User } from "./../models/User.js";
import { generateToken } from "./../utils/generateToken.js";
import RefreshToken from "../models/RefreshToken.js";

// user register
export const registerUser = async (req, res) => {
  logger.info("Register endpoint hit....");
  try {
    const { error } = validateRegistration(req.body);

    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      logger.warn("User already exists");
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    user = new User({ username, password, email });
    await user.save();

    logger.warn("user saved successfully", user._id);

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(201).json({
      success: true,
      message: "user register success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("register error", error.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
// user login
export const loginUser = async (req, res) => {
  try {
    logger.info("Loggin endpoint hit...");
    const { error } = validateLogin(req.body);

    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid user");
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("login error", error.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// refresh token
export const refreshTokenUser = async (req, res) => {
  try {
    logger.info("refreshToken endpoint hit...");
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh Token misssing");
      return res.status(404).json({
        success: false,
        message: "Refersh Token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiredAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
    const user = await User.findById(storedToken.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("refreshToken error", error.message);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

// logout

export const logoutUser = async (req, res) => {
  try {
    logger.info("logout endpoint hit");

    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh Token misssing");
      return res.status(404).json({
        success: false,
        message: "Refersh Token missing",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("refresh token deleted for logout");

    res.status(200).json({
      success: true,
      message: "logout success",
    });
  } catch (error) {
    logger.error("error while logout", error.message);
    res.status(500).json({
      success: false,
      message: `internal server error ${error.message}`,
    });
  }
};
