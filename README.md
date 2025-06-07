# Expense Tracker App

A modern expense tracking application built with Next.js, Supabase, and Clerk Authentication.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Alternative Development Options](#alternative-development-options)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Demo

Here's a look at the Expense Tracker App in action:

### Dashboard View
![Dashboard View](docs/dashboard.jpeg)
*The main dashboard showing expense analytics, budget utilization, category distribution, and recent expenses.*

### Mobile View & Add Expense Feature
<p align="center">
  <img src="docs/mobile_view.jpeg" alt="Mobile View" width="45%" />
  &nbsp; &nbsp; &nbsp; &nbsp;
  <img src="docs/add_expense_modal.jpeg" alt="Add Expense Modal" width="45%" />
</p>
<p align="center">
  <em>Mobile interface (left) and Add Expense feature (right)</em>
</p>

## Features

- Track expenses and income with category management
- Set and monitor budgets with visual progress tracking
- Responsive design works on desktop and mobile
- Secure authentication with Clerk
- Visual analytics with spending trends and budget comparisons
- Light/Dark mode
- Multi-currency support with automatic conversions
- Receipt scanning with AI-powered data extraction

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with shadcn/ui
- **Charts**: Recharts
- **AI Integration**: OpenAI for receipt processing

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase CLI installed ([Installation Guide](https://supabase.com/docs/guides/cli))
- Git installed

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/expense-tracker-app.git
cd expense-tracker-app
npm install
```

### 2. Supabase Database Setup

#### Option A: Using Supabase Cloud (Recommended for Production)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project reference ID from the URL: `https://supabase.com/dashboard/project/[PROJECT_REF_ID]`

2. **Install and Login to Supabase CLI**
   ```bash
   # Install Supabase CLI (if not already installed)
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   ```

3. **Link Your Local Project to Supabase Cloud**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF_ID
   ```
   Replace `YOUR_PROJECT_REF_ID` with your actual project reference from step 1.

4. **Initialize Database with Migrations and Seed Data**
   ```bash
   # Reset and initialize the database with migrations and seed data
   supabase db reset --linked
   ```

   This command will:
   - Drop all existing tables and data in the `public` schema
   - Run all migration files from `supabase/migrations/`
   - Automatically run `supabase/seed.sql` to populate initial data

#### Option B: Using Local Supabase (Development)

```bash
# Start local Supabase instance
supabase start

# The database will be automatically initialized with migrations and seed data
```

### 3. Database Management Commands

#### Resetting Your Database
```bash
# For cloud database (removes all data and reapplies migrations + seed)
supabase db reset --linked

# For local database
supabase db reset
```

#### Generating Fresh Seed Data
If you want to create a seed file from your current database data:
```bash
# Export current data to seed file
supabase db dump -f supabase/seed.sql --data-only
```

**Note about Seed Data**: The included `supabase/seed.sql` contains sample categories and settings with a hardcoded user ID. For development, you can:
1. Replace the user ID in `seed.sql` with your actual Clerk user ID after signing up
2. Or let the app create default categories automatically when you first use it

#### Applying Migrations
```bash
# Push local migrations to cloud database
supabase db push

# Pull remote migrations to local
supabase db pull
```

### 4. Authentication Setup

#### Set up Clerk
1. Create an account at [clerk.dev](https://clerk.dev)
2. Create a new application and get your API keys

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Configuration (get from Supabase dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for receipt processing - optional)
OPENAI_API_KEY=your_openai_api_key
```

### 6. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Deployment Options

### Serverless Deployment (Vercel + Supabase Cloud)

This is the recommended approach for production deployments.

1. **Database Setup**
   - Your Supabase cloud database should already be set up from the Quick Start steps above
   - If not, follow the "Supabase Database Setup" section

2. **Deploy to Vercel**
   - Fork this repository to your GitHub account
   - Import your repository in Vercel
   - Set up the environment variables from step 5 in Quick Start
   - Deploy!

## Alternative Development Options

### Option 1: Local Development with Docker Compose

### Option 1: Local Development with Docker Compose

Perfect for development or self-hosting.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker-app.git
   cd expense-tracker-app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.docker
   ```
   Edit the `.env.docker` file to include your Clerk and OpenAI API keys.

3. **Start the Docker containers**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Web App: [http://localhost:3000](http://localhost:3000)
   - Supabase Studio: [http://localhost:9000](http://localhost:9000)

5. **Essential Docker commands**
   ```bash
   # View logs
   docker-compose logs -f app
   
   # Stop all containers
   docker-compose down
   
   # Rebuild containers (after changes)
   docker-compose up -d --build
   ```

### Option 2: Local Development Without Docker

If you prefer developing without Docker and haven't followed the Quick Start:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Supabase local development**
   ```bash
   npx supabase start
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the necessary variables (see Quick Start section).

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:
- `users`: User information and preferences
- `user_settings`: User configuration settings
- `categories`: Expense categories with customizable colors
- `expenses`: Individual expense records with amounts and categories
- `budgets`: Budget limits for expense categories

For detailed schema information, check the migration files in `supabase/migrations/`.

## Troubleshooting

### Common Issues

- **Authentication Issues**: Verify your Clerk API keys in the `.env.local` file
- **Database Connection Issues**: 
  - For cloud: Ensure you've run `supabase link` and `supabase db reset --linked`
  - For local: Make sure `supabase start` completed successfully
- **Missing Tables**: Run `supabase db reset --linked` to apply all migrations
- **Receipt Processing**: Verify your OpenAI API key is valid and has sufficient credits

### Supabase CLI Troubleshooting

- **Permission Issues**: Make sure you're logged in with `supabase login`
- **Project Link Issues**: Verify your project reference ID is correct
- **Migration Errors**: Check the migration files in `supabase/migrations/` for syntax errors
- **Seed Data Issues**: Verify `supabase/seed.sql` exists and contains valid SQL

### Database Reset and Recovery

If your database gets into a bad state:

```bash
# For cloud database - complete reset
supabase db reset --linked

# For local database - complete reset  
supabase db reset

# If you need to generate new seed data from existing data
supabase db dump -f supabase/seed.sql --data-only
```

### Docker Troubleshooting

- **Port Conflicts**: Ensure ports 3000, 5432, 8000, and 9000 are available
- **Container Errors**: Check logs with `docker-compose logs -f`
- **Rebuild Containers**: Use `docker-compose up -d --build` after code changes

## Summary

### Essential Commands Quick Reference

| Task | Command | Description |
|------|---------|-------------|
| Setup | `supabase login` | Login to Supabase CLI |
| Setup | `supabase link --project-ref YOUR_PROJECT_REF_ID` | Link local project to cloud |
| Database | `supabase db reset --linked` | Reset cloud database with migrations + seed |
| Database | `supabase db reset` | Reset local database |
| Database | `supabase db push` | Push migrations to cloud |
| Database | `supabase db dump -f supabase/seed.sql --data-only` | Export data to seed file |
| Development | `npm run dev` | Start development server |
| Docker | `docker-compose up -d` | Start with Docker |

### What Each Reset Command Does

- `supabase db reset --linked`: 
  - Connects to your cloud Supabase database
  - Drops all tables and data in the `public` schema
  - Runs all migration files from `supabase/migrations/`
  - Runs `supabase/seed.sql` to populate initial data
  - Perfect for starting fresh or recovering from database issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.