import express from "express";
import {
  evaluateQuizAnswers,
  getQuestionsByParams,
} from "../controllers/quizController";

const router = express.Router();

router.get("/", getQuestionsByParams);
router.post("/score", evaluateQuizAnswers);

export default router;
