import express from "express";
import connectionPool from "../utils/db.mjs";
import answerValidate from "../middlewares/answerValidate.mjs";

const answersRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   get:
 *     summary: Get answers for a specific question
 *     description: Retrieves all answers associated with a given question ID. Returns an empty array if there are no answers.
 *     tags:
 *       - Answers
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the question to fetch answers for.
 *     responses:
 *       200:
 *         description: Successfully retrieved answers for the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       content:
 *                         type: string
 *                         example: "This is an answer."
 *                   example: []  # could be an empty list
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
 *       500:
 *         description: Server error while fetching answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to fetch answers.
 */
answersRouter.get("/", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  try {
    // 1. Check if question exists
    const checkQuestion = await connectionPool.query(
      `select * from questions WHERE id = $1`,
      [questionIdFromClient]
    );

    if (checkQuestion.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    // 2. Fetch related answers
    const response = await connectionPool.query(
      `select id, content
        from answers 
        where question_id = $1`,
      [questionIdFromClient]
    );

    return res.status(200).json({ data: response.rows });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   post:
 *     summary: Create an answer for a specific question
 *     description: Adds a new answer to the question identified by questionId.
 *     tags:
 *       - Answers
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the question to answer.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Here is a detailed answer to your question."
 *                 description: The content of the answer.
 *     responses:
 *       201:
 *         description: Answer created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer created successfully.
 *       400:
 *         description: Answer was not created due to bad input or other issue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Answer was not created.
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
 *       500:
 *         description: Server error while creating the answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to create answer.
 */
answersRouter.post("/", [answerValidate],async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const {content} = req.body;

  try {
    // 1. Check if question exists
    const checkQuestion = await connectionPool.query(
      `select * from questions WHERE id = $1`,
      [questionIdFromClient]
    );

    if (checkQuestion.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    // 2. create answers
    const response = await connectionPool.query(
        `insert into answers (question_id, content) 
        values ($1, $2)`,
        [questionIdFromClient, content]
      );

      if (response.rowCount === 1) {
        return res.status(201).json({
          "message": "Answer created successfully.",
        });
      } else {
        return res.status(400).json({
          "message": "Answer was not created.",
        });
      }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to create answer." });
  }
});

/**
 * @swagger
 * /questions/{questionId}/answers:
 *   delete:
 *     summary: Delete all answers for a specific question
 *     description: Deletes all answers associated with a given question ID. If there are no answers to delete, returns a 200 OK with a message.
 *     tags:
 *       - Answers
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the question whose answers will be deleted.
 *     responses:
 *       200:
 *         description: Deletion request processed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All answers for the question have been deleted successfully.
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
 *       500:
 *         description: Server error occurred while deleting answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to delete answers.
 */
answersRouter.delete("/", async (req, res) => {
    const questionIdFromClient = req.params.questionId;

    try {
        // 1. Check if question exists
    const checkQuestion = await connectionPool.query(
        `select * from questions where id = $1`,
        [questionIdFromClient]
      );
  
      if (checkQuestion.rowCount === 0) {
        return res.status(404).json({ message: "Question not found." });
      }

       // 2. delete answers
      const response = await connectionPool.query(
        `delete from answers where question_id = $1`, 
        [questionIdFromClient])

        return res.status(200).json({
          message:
            response.rowCount > 0
              ? "All answers for the question have been deleted successfully."
              : "No answers were found to delete.",
        });        
    } catch(error) {
        console.error("Error found: ", error);
        return res.status(500).json({"message": "Unable to delete answers."})
    }
})

export default answersRouter;
