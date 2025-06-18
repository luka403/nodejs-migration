export interface VendorCSV {
  VENDOR_ID: string;
  VENDOR_NAME: string;
  CREATE_DATE: string;
  LAST_MODIFIED_DATE: string;
}
export interface Vendor {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface VendorReference {
  _id: string;
  name: string;
} 