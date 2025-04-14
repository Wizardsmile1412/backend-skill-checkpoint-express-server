import express from "express";
import connectionPool from "../utils/db.mjs";
import answerValidate from "../middlewares/answerValidate.mjs";

const answersRouter = express.Router({ mergeParams: true });

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

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Answers not found." });
    }

    return res.status(200).json({ data: response.rows });
  } catch (error) {
    console.error("Error found: ", error);
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

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
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

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

        if (response.rowCount > 0) {
            return res.status(200).json({
              "message": "All answers for the question have been deleted successfully.",
            });
          } else {
            return res.status(400).json({
              "message": "Answers were not daleted.",
            });
          }
    } catch(error) {
        console.error("Error found: ", error);
        return res.status(500).json({"message": "Unable to delete answers."})
    }
})

export default answersRouter;
