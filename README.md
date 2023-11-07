# Tap Analytics API

This repository contains the Tap Analytics API, which provides an endpoint for aggregating tap data and a script for pre-populating the Prisma database with team, tag, and tap records.

## API Endpoint Usage

### Aggregating Tap Data

The endpoint `/api/analytics` allows for the aggregation of tap data based on a specified interval and date range.

#### Parameters:

- `token` (required): API token associated with a team.
- `interval` (required): The interval for aggregating data. Accepted values are `hour`, `day`, `week`, `month`, `quarter`.
- `start_date` (required): The start date for the data range (inclusive).
- `end_date` (required): The end date for the data range (inclusive).

#### Example Request:

```http
GET /api/analytics?token=<API_TOKEN>&interval=day&start_date=2023-01-10T21:24:07.933Z&end_date=2023-01-25T21:25:07.933Z
```

#### Example Response:

The response will be a JSON array containing the aggregated tap data for the specified interval and date range.

```json
[
  {"time_period":"2023-01-10T00:00:00.000Z","count":"1"},
  {"time_period":"2023-01-12T00:00:00.000Z","count":"3"},
  {"time_period":"2023-01-13T00:00:00.000Z","count":"4"},
  {"time_period":"2023-01-17T00:00:00.000Z","count":"25"},
  {"time_period":"2023-01-18T00:00:00.000Z","count":"2"},
  {"time_period":"2023-01-20T00:00:00.000Z","count":"2"},
  {"time_period":"2023-01-24T00:00:00.000Z","count":"3"}
]
```

## Local Development

To run the API server locally:

Install dependencies:

```code
npm install
```

Run the development server:

```code
npm run dev
```

Access the API at `http://localhost:3000/api/taps/analytics` with the required query parameters.

### Setting Up the Prisma Database

Prisma is an open-source database toolkit that makes it easy to work with databases. To get started with Prisma in this project, follow these steps:

#### Configure Your Database Connection

Create a .env file in the root of your project and specify your database connection string:

```code
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
```

Replace `USER`, `PASSWORD`, `HOST`, `PORT`, `DATABASE`, and `SCHEMA` with your actual database credentials.

#### Initialize Prisma

- Run the following command to set up Prisma using your .env file. This will create a prisma directory with a schema.prisma file that defines your database schema:

```code
prisma init
```

- Apply the Prisma Migrations

```code
prisma migrate dev --name init
```

- Generate the Prisma client, which is used in your application to access the database. 

```code
prisma generate
```

The Prisma client will be generated in node_modules/@prisma/client. You can now use it in your application to perform database operations.

### Pre-Populating the Database

The repository includes a script for importing data from CSV files into the Prisma database.

#### Prerequisites:
- Ensure you have a PostgreSQL database accessible via the `DATABASE_URL` environment variable.
- Place your CSV files named `teams.csv`, `tags.csv`, and `taps.csv` in the root directory of the project.

#### CSV file formating

Ensure that the CSV files are properly formatted and that the data types match the schema defined in Prisma. Expected CSV Data data types:
- `teams.csv`: Should contain id and name columns for team records.
- `tags.csv`: Should contain tagUid, teamId, and created_at columns for tag records.
- `taps.csv`: Should contain tagUid, count, and createdAt columns for tap records.

#### Running the Import Script:

To populate your database with the initial data, run the bulkImport.js script using Node.js:

```code
node bulkImport.js
```

This script will read the CSV files and insert the records into the corresponding tables in your database.

## Deployment

For deploying the API, you can use Vercel, which seamlessly integrates with Next.js projects. Follow the Vercel deployment documentation for more details.
