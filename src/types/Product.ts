import { VendorReference } from './Vendor';
export interface ProductCSV {
  SKU: string;
  MANUFACTURER_PART_NO: string;
  PRODUCT_NAME: string;
  VENDOR: string;
  DESCRIPTION: string;
  ACTIVE_STATUS: string;
  DISCONTINUED: string;
  CREATED_DATE: string;
  LAST_MODIFIED_DATE: string;
  COLOR: string;
  CATEGORY_CODE: string;
}
export interface CategoryReference {
  _id: string;
  name: string;
}
export interface Product {
  _id: string;
  manufacturerPartNumber?: string;
  name: string;
  description: string;
  color?: string;
  active: boolean;
  discontinued: boolean;
  createdAt: Date;
  updatedAt: Date;
  vendor: VendorReference;
  category: CategoryReference;
} 