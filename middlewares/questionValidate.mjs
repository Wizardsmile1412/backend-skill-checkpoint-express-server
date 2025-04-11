const questionValidate = (req, res, next) =>{
    const { title, description, category} = req.body;
    

    const errors = [];

    // Title validation
  if (!title || typeof title !== "string") {
    errors.push("Title is required");
  }

  //Description validation
  if (
    !description ||
    typeof description !== "string"
  ) {
    errors.push(
      "Description is required"
    );
  }

  // Category validation
  if (
    !category ||
    typeof category !== "string"
  ) {
    errors.push("Category is required such as Software, Food, Travel, Science, Etc");
  }

   // If errors found, return 400
   if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

export default questionValidate;