import express from "express";
import connectionPool from "../utils/db.mjs";
import questionValidate from "../middlewares/questionValidate.mjs";
import searchQueryValidate from "../middlewares/searchQueryValidate.mjs";

const questionRouter = express.Router();

questionRouter.get("/", async (req, res) => {
  try {
    const response = await connectionPool.query(`select * from questions`);

    return res.status(200).json({ data: response.rows });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ "message": "Unable to fetch questions." });
  }
});

questionRouter.get("/search", [searchQueryValidate], async (req, res) => {
  const {title, category} = req.query;

  try {
    let conditions = [];
    let values = [];
    let count = 1;

    if (title) {
      conditions.push(`title ILIKE $${count}`);
      values.push(`%${title}%`);
      count++;
    }

    if (category) {
      conditions.push(`category ILIKE $${count}`);
      values.push(`%${category}%`);
      count++;
    }

    const whereClause = conditions.length > 0? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `SELECT * FROM questions ${whereClause} ORDER BY id ASC`

    const response = await connectionPool.query(query, values);

    if (response.rowCount === 0) {
      return res.status(404).json({ "message": "Question not found." });
    }

    return res.status(200).json({
      data: response.rows,
    });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ "message": "Unable to fetch questions." });
  }
});

questionRouter.get("/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  try {
    const response = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionIdFromClient]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({ "message": "Question not found." });
    }

    return res.status(200).json({
      data: response.rows,
    });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ "message": "Unable to fetch questions." });
  }
});

questionRouter.post("/", [questionValidate], async (req, res) => {
  const { title, description, category } = req.body;

  try {
    const response = await connectionPool.query(
      `insert into questions (title, description, category)
        values ($1, $2, $3)`,
      [title, description, category]
    );

    if (response.rowCount === 1) {
      return res.status(201).json({
        "message": "Question created successfully.",
      });
    } else {
      return res.status(400).json({
        "message": "Question was not created.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ "message": "Unable to create question." });
  }
});

questionRouter.put("/:questionId", [questionValidate], async (req, res) => {
  const { title, description, category } = req.body;
  const questionIdFromClient = req.params.questionId;

  try {
    const response = await connectionPool.query(
    `UPDATE questions 
    SET title = $1, description = $2, category = $3
    WHERE id = $4`,
      [title, description, category, questionIdFromClient]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({ "message": "Question not found." });
    }

    if (response.rowCount === 1) {
      return res.status(200).json({
        "message": "Question updated successfully.",
      });
    } else {
      return res.status(400).json({
        "message": "Question was not updated.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ "message": "Unable to fetch questions." });
  }
});

questionRouter.delete("/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  try {
    const response = await connectionPool.query(
    `DELETE FROM questions
    WHERE id = $1`,
      [questionIdFromClient]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({ "message": "Question not found." });
    }

    if (response.rowCount === 1) {
      return res.status(200).json({
        "message": "Question post has been deleted successfully.",
      });
    } else {
      return res.status(400).json({
        "message": "Question was not daleted.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({"message": "Unable to delete question."});
  }
});

export default questionRouter;
