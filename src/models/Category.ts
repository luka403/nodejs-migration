import mongoose from "mongoose";
export interface ICategory extends mongoose.Document {
  _id: string;
  name: string;
}
const categorySchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  }
});
export const Category = mongoose.model<ICategory>('Category', categorySchema);
