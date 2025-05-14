import mongoose from "mongoose";
import axios from "axios";
import { CategoryModel } from "./models/category";
import { QuestionModel } from "./models/question";

// Utility function to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/trivia", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log("Connected to MongoDB for seeding");

    // Fetch categories
    const categoryResponse = await axios.get(
      "https://opentdb.com/api_category.php"
    );
    const categories = categoryResponse.data.trivia_categories;

    // Clear existing data
    await CategoryModel.deleteMany({});
    await QuestionModel.deleteMany({});

    // Seed categories
    await CategoryModel.insertMany(categories);
    console.log("Categories seeded");

    // Seed questions for each category with rate limit handling
    for (const category of categories) {
      const difficulties = ["easy", "medium", "hard"];
      for (const difficulty of difficulties) {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          try {
            const response = await axios.get(
              `https://opentdb.com/api.php?amount=10&category=${category.id}&difficulty=${difficulty}&type=multiple`
            );
            const questions = response.data.results.map((q: any) => ({
              category: category.id,
              difficulty,
              question: q.question,
              correct_answer: q.correct_answer,
              incorrect_answers: q.incorrect_answers,
            }));
            await QuestionModel.insertMany(questions);
            console.log(
              `Seeded questions for category ${category.name}, difficulty ${difficulty}`
            );
            break;
          } catch (error: any) {
            attempts++;
            if (error.response && error.response.status === 429) {
              console.warn(
                `Rate limit hit for category ${category.name}, difficulty ${difficulty}. Retrying (${attempts}/${maxAttempts})...`
              );
              await delay(5000); // Wait 5 seconds before retrying
            } else {
              console.error(
                `Error seeding category ${category.name}, difficulty ${difficulty}:`,
                error.message
              );
              break; // Exit on non-429 errors
            }
          }
        }
        // Delay between requests to avoid rate limiting
        await delay(1000);
      }
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
