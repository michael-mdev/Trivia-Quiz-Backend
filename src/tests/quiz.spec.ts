import "jest";
import express from "express";
import supertest from "supertest";
import mongoose from "mongoose";
import {
  evaluateQuizAnswers,
  getQuestionsByParams,
} from "../controllers/quizController";
import { QuestionModel } from "../models/question";
jest.mock("../models/Question");

const app = express();
app.use(express.json());
app.get("/api/quiz", getQuestionsByParams);
app.post("/api/quiz/score", evaluateQuizAnswers);

describe("GET /api/quiz", () => {
  const mockQuestions = [
    {
      _id: new mongoose.Types.ObjectId(),
      question: "What is 2 + 2?",
      correct_answer: "4",
      incorrect_answers: ["1", "2", "3"],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      question: "Capital of France?",
      correct_answer: "Paris",
      incorrect_answers: ["Berlin", "London", "Madrid"],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      question: "Which planet is closest to the sun?",
      correct_answer: "Mercury",
      incorrect_answers: ["Venus", "Earth", "Mars"],
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return formatted questions if valid query is provided", async () => {
    (QuestionModel.aggregate as jest.Mock).mockResolvedValue(mockQuestions);

    const res = await supertest(app).get(
      "/api/quiz?category=1&difficulty=easy&amount=3"
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("question");
    expect(res.body[0]).toHaveProperty("answers");
    expect(res.body[0].answers.length).toBe(4);
  });

  it("should return 400 if category or difficulty is missing", async () => {
    const res = await supertest(app).get("/api/quiz?category=1");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Category and difficulty are required");
  });

  it("should return 400 if not enough questions are available", async () => {
    (QuestionModel.aggregate as jest.Mock).mockResolvedValue([
      mockQuestions[0],
    ]);

    const res = await supertest(app).get(
      "/api/quiz?category=1&difficulty=easy&amount=3"
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Not enough questions available");
  });

  it("should return 500 if an internal error occurs", async () => {
    (QuestionModel.aggregate as jest.Mock).mockRejectedValue(
      new Error("DB failure")
    );

    const res = await supertest(app).get(
      "/api/quiz?category=1&difficulty=easy&amount=3"
    );
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Server error");
  });
});

describe("POST /api/quiz/score", () => {
  const question1 = {
    _id: new mongoose.Types.ObjectId(),
    question: "What is the capital of Italy?",
    correct_answer: "Rome",
    incorrect_answers: ["Milan", "Venice", "Florence"],
  };

  const question2 = {
    _id: new mongoose.Types.ObjectId(),
    question: "5 + 7 = ?",
    correct_answer: "12",
    incorrect_answers: ["10", "11", "13"],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct score and results for submitted answers", async () => {
    (QuestionModel.find as jest.Mock).mockResolvedValue([question1, question2]);

    const res = await supertest(app)
      .post("/api/quiz/score")
      .send({
        answers: {
          [question1._id.toString()]: "Rome",
          [question2._id.toString()]: "11",
        },
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("score", 1);
    expect(res.body.results).toEqual({
      [question1._id.toString()]: {
        selected: "Rome",
        correct: "Rome",
      },
      [question2._id.toString()]: {
        selected: "11",
        correct: "12",
      },
    });
  });

  it("should return 400 if answers object is missing or empty", async () => {
    const res = await supertest(app).post("/api/quiz/score").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Answers are required");
  });

  it("should return 500 if database query fails", async () => {
    (QuestionModel.find as jest.Mock).mockRejectedValue(new Error("DB error"));

    const res = await supertest(app)
      .post("/api/quiz/score")
      .send({
        answers: {
          [question1._id.toString()]: "Rome",
        },
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Server error");
  });
});
