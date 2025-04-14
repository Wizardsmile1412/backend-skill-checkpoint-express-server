import express from "express";
import questionRouter from "./routes/questionsRoutes.mjs";
import answersRouter from "./routes/answersRoutes.mjs";
import voteAnswerRouter from "./routes/voteAnswerRoutes.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.use("/questions", questionRouter);

app.use("/questions/:questionId/answers", answersRouter);

app.use("/answers/:answerId/vote", voteAnswerRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
