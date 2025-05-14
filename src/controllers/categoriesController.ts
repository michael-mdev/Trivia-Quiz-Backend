import { Request, Response } from "express";
import { CategoryModel } from "../models/category";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
