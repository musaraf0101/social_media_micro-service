import { logger } from "./../utils/logger.js";
import Post from "./../models/Post.js";
import { validateCreatePost } from "./../utils/validation.js";

export const createPost = async (req, res) => {
  try {
    logger.info("create post endpoint hit...");

    const { error } = validateCreatePost(req.body);

    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();

    logger.info("post created");

    res.status(201).json({
      success: true,
      message: "post created",
    });
  } catch (error) {
    logger.error(`Error creating post`, error.message);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

export const getAllPost = async (req, res) => {
  try {
    logger.info("getAllPost post endpoint hit...");
  } catch (error) {
    logger.error(`Error fetching post`, error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
    });
  }
};

export const getPost = async (req, res) => {
  try {
    logger.info("getPost post endpoint hit...");
  } catch (error) {
    logger.error(`Error fetching post`, error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    logger.info("deletePost post endpoint hit...");
  } catch (error) {
    logger.error(`Error delete post`, error.message);
    res.status(500).json({
      success: false,
      message: "Error delete post",
    });
  }
};
