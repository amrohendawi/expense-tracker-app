#!/bin/bash

# Check if we have the required environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "Error: SUPABASE_DB_URL environment variable is not set"
    exit 1
fi

# Apply migrations
echo "Applying database migrations..."
npx supabase db push --db-url "$SUPABASE_DB_URL"

# Run seed script if this is initial setup
if [ "$INITIAL_SETUP" = "true" ]; then
    echo "Running seed script..."
    psql "$SUPABASE_DB_URL" -f supabase/seed.sql
fi

echo "Database setup completed successfully!"
