import mongoose, { Schema } from 'mongoose';

export interface ICategory {
  id: number;
  name: string;
}

const categorySchema = new Schema<ICategory>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
});

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);