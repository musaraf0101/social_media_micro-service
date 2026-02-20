import express from "express";
import { authenticateRequest } from "../middleware/auth.middleware.js";
import { createPost } from './../controllers/post.controller.js';

const router = express();

router.use(authenticateRequest)

router.post("/create-post",createPost)

export default router;
