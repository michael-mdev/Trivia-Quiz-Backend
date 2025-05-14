import mongoose, { Schema } from 'mongoose';

export interface IQuestion {
  category: number;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const questionSchema = new Schema<IQuestion>({
  category: { type: Number, required: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  correct_answer: { type: String, required: true },
  incorrect_answers: [{ type: String, required: true }],
});

export const QuestionModel = mongoose.model<IQuestion>('Question', questionSchema);