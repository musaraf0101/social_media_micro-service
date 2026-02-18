import express from "express";
import {
  loginUser,
  logoutUser,
  refreshTokenUser,
  registerUser,
} from "../controllers/identity.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshToken", refreshTokenUser);
router.post("/logout", logoutUser);

export default router;
