# Database Setup Instructions

## The Problem

You're getting the error "Could not find the table 'public.stores' in the schema cache" because the database tables haven't been created in your Supabase instance yet.

## Quick Fix Solution

### Option 1: Use Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: https://supabase.com/dashboard/project/jqiecatuacaggclfolar
3. Click on "SQL Editor" in the left sidebar
4. Create a new query and copy-paste the following SQL:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  layout_json JSONB NOT NULL,
  theme_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- cents
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  customer_email TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generations table (for tracking AI generations)
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_generations_ip_created ON generations(ip_address, created_at);
```

5. Click "Run" to execute the schema

### Option 2: Use Supabase CLI (If you have Docker)

If you have Docker installed, you can use the Supabase CLI:

1. Install Supabase CLI: `npm install -g supabase`
2. Link to your project: `supabase link --project-ref jqiecatuacaggclfolar`
3. Push the schema: `supabase db push`

## Verification

After applying the schema, you can verify it worked by running:

```bash
node test-db.js
```

You should see "✓ Successfully connected to Supabase" and "✓ Stores table exists" messages.

## Why This Happened

The database schema file (`database-schema.sql`) exists in your project but was never actually executed against your Supabase database. This is a common issue when setting up new Supabase projects - the schema needs to be manually applied through the dashboard or CLI.
