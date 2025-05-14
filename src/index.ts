import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import categoryRoutes from "./routes/categories";
import quizRoutes from "./routes/quiz";

// To seed the Project use npm run seed

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_DB_URI || "", {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/categories", categoryRoutes);
app.use("/api/quiz", quizRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
