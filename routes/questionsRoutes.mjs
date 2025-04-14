import express from "express";
import connectionPool from "../utils/db.mjs";
import questionValidate from "../middlewares/questionValidate.mjs";
import searchQueryValidate from "../middlewares/searchQueryValidate.mjs";
import voteValidate from "../middlewares/voteValidate.mjs";

const questionRouter = express.Router();

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: A list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Unable to fetch a question
 */
questionRouter.get("/", async (req, res) => {
  try {
    const response = await connectionPool.query(`select * from questions`);

    return res.status(200).json({ data: response.rows });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions by title or category
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Keyword to match the question title
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Keyword to match the question category
 *     responses:
 *       200:
 *         description: A list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *        description: Invalid search parameters
 *       404:
 *        description: Question not found
 *       500:
 *        description: Unable to fetch a question
 *
 */
questionRouter.get("/search", [searchQueryValidate], async (req, res) => {
  const { title, category } = req.query;

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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `SELECT * FROM questions ${whereClause} ORDER BY id ASC`;

    const response = await connectionPool.query(query, values);

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      data: response.rows,
    });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a specific question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to retrieve
 *     responses:
 *       200:
 *         description: The requested question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to fetch questions
 */
questionRouter.get("/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  try {
    const response = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionIdFromClient]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      data: response.rows,
    });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *        description: Invalid request data
 *       500:
 *        description: Unable to fetch a question
 *
 */
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
        message: "Question created successfully.",
      });
    } else {
      return res.status(400).json({
        message: "Question was not created.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to create question." });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update an existing question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Question was not updated
 *       404:
 *         description: Question not found
 *       500:
 *         description: Unable to fetch questions
 */
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
      return res.status(404).json({ message: "Question not found." });
    }

    if (response.rowCount === 1) {
      return res.status(200).json({
        message: "Question updated successfully.",
      });
    } else {
      return res.status(400).json({
        message: "Question was not updated.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question by ID
 *     description: Deletes a question post from the database using the provided question ID.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the question to be deleted.
 *     responses:
 *       200:
 *         description: Question post has been deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question post has been deleted successfully.
 *       404:
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found.
 *       400:
 *         description: Question was not deleted due to an unexpected issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question was not deleted.
 *       500:
 *         description: Server error occurred while deleting the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to delete question.
 */
questionRouter.delete("/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  try {
    const response = await connectionPool.query(
      `DELETE FROM questions
    WHERE id = $1`,
      [questionIdFromClient]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    if (response.rowCount === 1) {
      return res.status(200).json({
        message: "Question post has been deleted successfully.",
      });
    } else {
      return res.status(400).json({
        message: "Question was not daleted.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

/**
 * @swagger
 * /questions/{questionId}/vote:
 *   post:
 *     summary: Vote on a question
 *     description: Records a vote (e.g., upvote/downvote) on a specific question by its ID.
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the question to vote on.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vote
 *             properties:
 *               vote:
 *                 type: integer
 *                 example: 1
 *                 description: Vote value (e.g., 1 for upvote, -1 for downvote).
 *     responses:
 *       201:
 *         description: Vote on the question has been recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vote on the question has been recorded successfully.
 *       404:
 *         description: Question not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found.
 *       400:
 *         description: Vote could not be recorded due to a bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vote on the question cannot be recorded.
 *       500:
 *         description: Server error occurred while creating the vote.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to create question.
 */
questionRouter.post("/:questionId/vote", [voteValidate], async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const { vote } = req.body;

  try {
    // Check if question exists
    const checkQuestion = await connectionPool.query(
      `
      select * from questions
      where id = $1`,
      [questionIdFromClient]
    );

    if (checkQuestion.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Create questions vote
    const response = await connectionPool.query(
      `insert into question_votes (question_id, vote)
        values ($1, $2)`,
      [questionIdFromClient, vote]
    );

    if (response.rowCount === 1) {
      return res.status(201).json({
        message: "Vote on the question has been recorded successfully.",
      });
    } else {
      return res.status(400).json({
        message: "Vote on the question cannot be recorded.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to create question." });
  }
});

export default questionRouter;
