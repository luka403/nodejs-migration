import mongoose from "mongoose";
export interface ICategoryNode {
  _id: string;
  name: string;
  children: ICategoryNode[];
}
export interface ICategoryTree extends mongoose.Document {
  _id: string;
  children: ICategoryNode[];
}
const categoryNodeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  children: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { _id: false });
const categoryTreeSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: "categoryTree" },
  children: { type: [categoryNodeSchema], default: [] }
});
export const CategoryTree = mongoose.model<ICategoryTree>('CategoryTree', categoryTreeSchema);
