import mongoose from "mongoose";
export interface IProduct extends mongoose.Document {
  _id: string;
  manufacturerPartNumber?: string;
  name: string;
  description: string;
  color?: string;
  active: boolean;
  discontinued: boolean;
  createdAt: Date;
  updatedAt: Date;
  vendor: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
}
const productSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  },
  manufacturerPartNumber: { 
    type: String 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  color: { 
    type: String,
    trim: true
  },
  active: { 
    type: Boolean, 
    required: true 
  },
  discontinued: { 
    type: Boolean, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    required: true 
  },
  vendor: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  },
  category: {
    _id: { type: String, required: true },
    name: { type: String, required: true }
  }
}, { 
  timestamps: false 
});
export const Product = mongoose.model<IProduct>('Product', productSchema);
