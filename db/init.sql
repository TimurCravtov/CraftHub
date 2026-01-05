-- Initialization SQL for HandmadeShop DB
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Example table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
