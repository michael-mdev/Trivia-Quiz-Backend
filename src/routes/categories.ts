import express from "express";
import { getAllCategories } from "../controllers/categoriesController";

const router = express.Router();

router.get("/", getAllCategories);

export default router;
