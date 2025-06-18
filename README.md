# CSV to MongoDB Data Migration

A robust Node.js application for migrating CSV data to MongoDB with support for complex data structures, including hierarchical category trees, vendor data, and products with relational references.

## Features

- Migrates CSV data for Categories, Vendors, and Products
- Builds hierarchical category trees from flat CSV data
- Handles relational references between entities
- Supports batch processing for large datasets
- Provides robust error handling and validation
- Includes transaction support for atomic operations
- Offers detailed logging with progress tracking

## Requirements

- Node.js 16+
- MongoDB 4.4+
- TypeScript 4.9+

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure the application by copying `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Edit the `.env` file to match your environment:

```
# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/migration

# Environment
NODE_ENV=development

# Migration settings
MIGRATION_BATCH_SIZE=1000
MIGRATION_RETRY_ATTEMPTS=3
MIGRATION_USE_TRANSACTIONS=true

# File paths (relative to project root)
CATEGORIES_PATH=./categories.csv
VENDORS_PATH=./vendors.csv
PRODUCTS_PATH=./products.csv
```

## Running Migrations

### Running All Migrations

To run all migrations in sequence:

```bash
npm run migrate:all
```

### Running Individual Migrations

To run individual migrations:

```bash
# Migrate categories
npm run migrate:categories

# Migrate vendors
npm run migrate:vendors

# Migrate products
npm run migrate:products
```

## Migration Process

The application migrates data in the following order:

1. **Categories**: Imports categories and builds a hierarchical tree structure
2. **Vendors**: Imports vendor data with proper date handling
3. **Products**: Imports products with references to categories and vendors

## Data Models

### Category

```typescript
{
  _id: string,   // from CATEGORY_CODE
  name: string   // from CATEGORY_NAME
}
```

### Category Tree

```typescript
{
  _id: "categoryTree",
  children: [
    {
      _id: "01",
      name: "Dinnerware",
      children: [
        {
          _id: "0101",
          name: "Select China",
          children: [
            // nested categories...
          ]
        }
      ]
    }
  ]
}
```

### Vendor

```typescript
{
  _id: string,       // from VENDOR_ID
  name: string,      // from VENDOR_NAME
  createdAt: Date,   // parsed from CREATE_DATE
  updatedAt: Date    // parsed from LAST_MODIFIED_DATE
}
```

### Product

```typescript
{
  _id: string,                 // from SKU
  manufacturerPartNumber?: string, // from MANUFACTURER_PART_NO
  name: string,                // from PRODUCT_NAME
  description: string,         // from DESCRIPTION
  color?: string,              // from COLOR
  active: boolean,             // Yes/No from ACTIVE_STATUS
  discontinued: boolean,       // Yes/No from DISCONTINUED
  createdAt: Date,             // from CREATED_DATE
  updatedAt: Date,             // from LAST_MODIFIED_DATE
  vendor: {                    // Reference to vendor
    _id: string,
    name: string
  },
  category: {                  // Reference to category
    _id: string,
    name: string
  }
}
```

## Configuration

Configuration is managed through environment variables in the `.env` file:

| Variable                     | Description                                      | Default                               |
| ---------------------------- | ------------------------------------------------ | ------------------------------------- |
| `MONGO_URI`                  | MongoDB connection string                        | `mongodb://localhost:27017/migration` |
| `NODE_ENV`                   | Environment (development, production, test)      | `development`                         |
| `MIGRATION_BATCH_SIZE`       | Number of records to process in each batch       | `1000`                                |
| `MIGRATION_RETRY_ATTEMPTS`   | Number of retry attempts for database operations | `3`                                   |
| `MIGRATION_USE_TRANSACTIONS` | Whether to use MongoDB transactions              | `true`                                |
| `CATEGORIES_PATH`            | Path to categories CSV file                      | `./categories.csv`                    |
| `VENDORS_PATH`               | Path to vendors CSV file                         | `./vendors.csv`                       |
| `PRODUCTS_PATH`              | Path to products CSV file                        | `./products.csv`                      |

## Error Handling

The application includes comprehensive error handling:

- Validation errors for data integrity
- Database connection retry logic
- Transaction support for atomicity
- Detailed error logging with stack traces
- Graceful handling of duplicate records

## Performance Optimization

For large datasets, the application implements:

- Batch processing to reduce memory usage
- Bulk database operations for improved performance
- Caching of reference data for faster lookups
- Progress tracking for long-running operations

## License

ISC
