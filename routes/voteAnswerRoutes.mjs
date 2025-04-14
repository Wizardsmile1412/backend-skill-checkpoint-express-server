import express from "express";
import connectionPool from "../utils/db.mjs";
import voteValidate from "../middlewares/voteValidate.mjs";

const voteAnswerRouter = express.Router({ mergeParams: true });

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
