import { Request, Response } from "express";
import { QuestionModel } from "../models/question";

export const getQuestionsByParams = async (req: Request, res: Response) => {
  const { category, difficulty, amount = 5 } = req.query;

  if (!category || !difficulty) {
    return res
      .status(400)
      .json({ error: "Category and difficulty are required" });
  }

  try {
    const questions = await QuestionModel.aggregate([
      {
        $match: {
          category: Number(category),
          difficulty: difficulty as string,
        },
      },
      { $sample: { size: Number(amount) } },
    ]);

    if (questions.length < Number(amount)) {
      return res.status(400).json({ error: "Not enough questions available" });
    }

    // Shuffle answers and exclude correct_answer from response
    const formattedQuestions = questions.map((q) => {
      const answers = [...q.incorrect_answers, q.correct_answer].sort(
        () => Math.random() - 0.5
      );
      return {
        id: q._id,
        question: q.question,
        answers,
      };
    });

    res.json(formattedQuestions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const evaluateQuizAnswers = async (req: Request, res: Response) => {
  const { answers }: { answers: { [key: string]: string } } = req.body;

  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).json({ error: "Answers are required" });
  }

  try {
    const questionIds = Object.keys(answers);
    const questions = await QuestionModel.find({ _id: { $in: questionIds } });

    let score = 0;
    const results: { [key: string]: { selected: string; correct: string } } =
      {};

    for (const question of questions) {
      const selectedAnswer = answers[question._id.toString()];
      const isCorrect = selectedAnswer === question.correct_answer;
      if (isCorrect) score++;
      results[question._id.toString()] = {
        selected: selectedAnswer,
        correct: question.correct_answer,
      };
    }

    res.json({ score, results });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
