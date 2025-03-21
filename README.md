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

Create a `.env` file in the root directory with the following variables:

```env
# Database
POSTGRES_PRISMA_URL="postgresql://postgres:password@db.example.supabase.co:5432/postgres?pgbouncer=true"
POSTGRES_URL="postgresql://postgres:password@db.example.supabase.co:5432/postgres"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

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

# If you need to reset your database during development
npx prisma migrate reset

# To view your database with Prisma Studio
npx prisma studio
```

### 6. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
