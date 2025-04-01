This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Expense Tracker App

A full-featured expense tracking application built with Next.js 15, Clerk authentication, Prisma ORM, and Supabase PostgreSQL.

## Features

- 🔐 User authentication with Clerk
- 📊 Dashboard with expense analytics
- 💰 Track expenses by categories
- 📅 Filter expenses by date range
- 📱 Responsive design
- 🎨 Customizable expense categories
- 💼 Budget management

## Todos

- [ ] Add scan your receipt feature
- [ ] Fix currency selection not working issue
- [ ] Add AI expense analysis and suggestions

## Tech Stack

- **Framework**: Next.js 15.1.0
- **Authentication**: Clerk v6
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma 6.4.1
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database (local or hosted on Supabase)
- Clerk account for authentication

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

Create a `.env` file in the root directory by copying the `.env.example` file:

```bash
cp .env.example .env
```

then, replace the values in the `.env` file with your own values.

### 4. Set up Clerk Authentication

1. Create an account at [clerk.dev](https://clerk.dev)
2. Create a new application
3. Get your API keys from the Clerk dashboard
4. Add the keys to your `.env` file

### 5. Set up the database with Prisma

Initialize your database:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# If you need to reset your database during development (DO NOT DO IT IN PRODUCTION!!!!)
npx prisma migrate reset

# To view your database with Prisma Studio
npx prisma studio
```

during development and altering the prisma DB schema it's best advised to use the following commands:

```bash
# create migration 
npx prisma migrate dev --name <migration_name>

# apply migration
npx prisma migrate deploy

# generate prisma client
npx prisma generate
```

### 6. OpenAI API Key

Get your OpenAI API key from [OpenAI](https://platform.openai.com/api-keys), create an account and set up billing and budget to prevent unexpected charges. Add the key to your `.env` file.

### 7. Run the development server

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
- Prisma migrations

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

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

### Database Considerations for Production

For production deployments:

1. Use a connection pooling solution (Supabase provides this)
2. Ensure SSL is enabled for database connections
3. Set up proper database backups

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
