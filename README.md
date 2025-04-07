This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Expense Tracker App

A modern expense tracking application built with Next.js, Supabase, and Clerk Authentication.

## Features

- 📊 Track expenses and income
- 💰 Set and monitor budgets
- 📱 Responsive design
- 🔒 Secure authentication with Clerk
- 📈 Visual analytics and reports
- 🌙 Light/Dark mode
- 💱 Multi-currency support
- 📷 Receipt scanning and OCR

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Validation**: Zod
- **AI Integration**: OpenAI for receipt processing

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or later
- Docker and Docker Compose
- Clerk account
- OpenAI API key (for receipt processing)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/expense-tracker-app.git
cd expense-tracker-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI (for receipt processing)
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database with Supabase

Start the Supabase services:

```bash
docker-compose up -d
```

Initialize the database:

```bash
npx supabase db reset
```

### 5. Set up Clerk Authentication

1. Create an account at [clerk.dev](https://clerk.dev)
2. Create a new application
3. Get your API keys from the Clerk dashboard
4. Add the keys to your `.env` file

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running with Docker

You can also run the entire application stack using Docker Compose, which will set up:
- The Next.js application
- PostgreSQL database
- Supabase services

### Prerequisites for Docker

- Docker and Docker Compose installed on your machine
- Basic understanding of Docker concepts

### Steps to run with Docker

1. Make sure Docker is running on your machine

2. Set up environment variables for Docker:
   ```bash
   cp .env.example .env.docker
   ```
   Edit the `.env.docker` file to include your Clerk and OpenAI API keys.

3. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```
   This will start all services in detached mode.

4. Access the application:
   - Next.js app: [http://localhost:3000](http://localhost:3000)
   - Supabase Studio: [http://localhost:9000](http://localhost:9000)

5. To stop the containers:
   ```bash
   docker-compose down
   ```

6. To view logs:
   ```bash
   docker-compose logs -f app
   ```

### Environment Variables for Docker

When running with Docker, the database connection strings are automatically configured to connect to the PostgreSQL container. However, you still need to provide:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `OPENAI_API_KEY`: Your OpenAI API key

You can either:
- Add them to your `.env.docker` file, or
- Pass them as environment variables when running docker-compose:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key CLERK_SECRET_KEY=your_secret OPENAI_API_KEY=your_openai_key docker-compose up -d
  ```

## Database Schema

The application uses the following main models:

- **User**: Stores user information
- **Category**: Expense categories with customizable colors and icons
- **Expense**: Individual expense records
- **Budget**: Budget limits for categories

## Troubleshooting

### Categories not appearing

If categories are not appearing for a new user:

1. Visit `/dashboard/debug` to check user and category status
2. Ensure your database connection is working properly
3. Check the browser console for any errors

### Authentication issues

If you're experiencing authentication issues:

1. Verify your Clerk API keys in the `.env` file
2. Make sure the Clerk URLs are configured correctly
3. Check that the middleware.ts file is properly set up

### Docker Issues

If you encounter issues with the Docker setup:

1. Check container logs: `docker-compose logs -f`
2. Ensure ports 3000, 5432, 8000, and 9000 are not in use by other applications
3. Try rebuilding the containers: `docker-compose build --no-cache`
4. Verify your Docker and Docker Compose versions are up to date

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Set up the following environment variables in Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `SUPABASE_DB_URL` (for database migrations)

4. Deploy your database:
   ```bash
   # Set your Supabase database URL
   export SUPABASE_DB_URL=postgres://your-connection-string

   # For initial deployment, set INITIAL_SETUP to true
   export INITIAL_SETUP=true

   # Run the deployment script
   npm run deploy:db
   ```

5. Deploy your application:
   ```bash
   git push origin main
   ```

The deployment script will:
1. Apply all database migrations
2. Run the seed script if this is the initial setup
3. Set up Row Level Security policies

### Local Development

1. Start the Supabase services:
   ```bash
   npm run db:start
   ```

2. Reset the database (applies migrations and seed):
   ```bash
   npm run db:reset
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access Supabase Studio:
   ```bash
   npm run db:studio
   ```

### Managing the Database

- Reset the database (applies migrations and seed):
  ```bash
  npm run db:reset
  ```

- Push schema changes to production:
  ```bash
  npm run db:push
  ```

- Create a new migration:
  ```bash
  npx supabase migration new your_migration_name
  ```

### Environment Variables

Create a `.env` file with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI (for receipt processing)
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For production deployment
SUPABASE_DB_URL=your_production_db_url
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
