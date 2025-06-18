import mongoose from "mongoose";
export interface IVendor extends mongoose.Document {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
const vendorSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  createdAt: { 
    type: Date, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    required: true 
  }
}, { 
  timestamps: false
});
export const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);
