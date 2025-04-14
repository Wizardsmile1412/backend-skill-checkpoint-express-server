import express from "express";
import connectionPool from "../utils/db.mjs";
import voteValidate from "../middlewares/voteValidate.mjs";

const voteAnswerRouter = express.Router({ mergeParams: true });

/**
 * @swagger
 * /answers/{answerId}/vote:
 *   post:
 *     summary: Vote on an answer
 *     description: Records a vote (e.g., upvote or downvote) on a specific answer by its ID.
 *     tags:
 *       - Answers
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the answer to vote on.
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
 *       200:
 *         description: Vote on the answer has been recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vote on the answer has been recorded successfully.
 *       404:
 *         description: Answer not found.
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
 *                   example: Vote on the answer can not record.
 *       500:
 *         description: Server error occurred while voting on the answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unable to vote answer.
 */
voteAnswerRouter.post("/", [voteValidate],async (req, res) => {
  const answerIdFromClient = req.params.answerId;
  const { vote } = req.body;

  try {
    // 1. Check if answer exists
    const checkAnswer = await connectionPool.query(
      `select * from answers where id = $1`,
      [answerIdFromClient]
    );

    if (checkAnswer.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    // 2. Vote answer
    const response = await connectionPool.query(
      `insert into answer_votes (answer_id, vote)
        values ($1, $2)`,
      [answerIdFromClient, vote]
    );

    if (response.rowCount === 1) {
      return res
        .status(200)
        .json({
          message: "Vote on the answer has been recorded successfully.",
        });
    } else {
      return res.status(400).json({
        message: "Vote on the answer can not record.",
      });
    }
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to vote answer." });
  }
});

export default voteAnswerRouter;
