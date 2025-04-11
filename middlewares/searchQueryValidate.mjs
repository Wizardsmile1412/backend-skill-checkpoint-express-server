const searchQueryValidate = (req, res, next) => {
  const { title, category } = req.query;

  // At least one must exist
  if (!title && !category) {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  // Optional: Check types
  if (title && typeof title !== "string") {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  if (category && typeof category !== "string") {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  next();
};

export default searchQueryValidate;
