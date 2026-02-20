import joi from "joi";

export const validateCreatePost = (data) => {
  const schema = joi.object({
    content: joi.string().min(3).max(50).required(),
  });

  return schema.validate(data);
};
