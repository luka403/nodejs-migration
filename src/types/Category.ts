export interface CategoryCSV {
  CATEGORY_CODE: string;
  CATEGORY_NAME: string;
  CREATE_DATE: string;
  LAST_MODIFIED_DATE: string;
}
export interface Category {
  _id: string;
  name: string;
}
export interface CategoryNode {
  _id: string;
  name: string;
  children: CategoryNode[];
}
export interface CategoryTree {
  _id: string;
  children: CategoryNode[];
} 