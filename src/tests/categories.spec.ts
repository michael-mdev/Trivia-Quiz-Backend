import "jest";
import supertest from "supertest";
import express from "express";
import { getAllCategories } from "../controllers/categoriesController";
import { CategoryModel } from "../models/category";

jest.mock("../models/Category");

const app = express();
app.get("/api/categories", getAllCategories);

describe("GET /api/categories", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return categories", async () => {
    const mockCategories = [
      { _id: "1", name: "Art" },
      { _id: "2", name: "Science" },
    ];

    (CategoryModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockCategories),
    });

    const res = await supertest(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockCategories);
  });

  it("should return 500 on server error", async () => {
    (CategoryModel.find as jest.Mock).mockImplementation(() => ({
      sort: jest.fn().mockRejectedValue(new Error("DB error")),
    }));

    const res = await supertest(app).get("/api/categories");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Server error" });
  });
});
