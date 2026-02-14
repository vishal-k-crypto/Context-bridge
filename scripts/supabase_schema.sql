-- ===========================================
-- Supabase Schema for MCP Builder Demo
-- ===========================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. Coupon Codes Table
-- ===========================================
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    uses_remaining INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some test coupon codes
INSERT INTO coupon_codes (code, uses_remaining) VALUES
    ('DEMO2024', 100),
    ('CONTEXTBRIDGE', 50),
    ('HELPERMCP', 25)
ON CONFLICT (code) DO NOTHING;

-- ===========================================
-- 2. MCP Generation Requests Table
-- ===========================================
CREATE TABLE IF NOT EXISTS mcp_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_code TEXT NOT NULL,
    goal TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    logs TEXT[] DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster pending request queries
CREATE INDEX IF NOT EXISTS idx_mcp_requests_status ON mcp_requests(status);
CREATE INDEX IF NOT EXISTS idx_mcp_requests_created ON mcp_requests(created_at DESC);

-- ===========================================
-- 3. MCP Results Table
-- ===========================================
CREATE TABLE IF NOT EXISTS mcp_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES mcp_requests(id) ON DELETE CASCADE,
    server_code TEXT,
    tools_json JSONB DEFAULT '{}',
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster result lookups
CREATE INDEX IF NOT EXISTS idx_mcp_results_request ON mcp_results(request_id);

-- ===========================================
-- 4. Enable Realtime for mcp_requests
-- ===========================================
-- This allows the frontend to receive live updates
-- Only add if not already a member
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'mcp_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE mcp_requests;
    END IF;
END $$;

-- ===========================================
-- 5. Row Level Security (RLS) Policies
-- ===========================================
-- Enable RLS
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_results ENABLE ROW LEVEL SECURITY;

-- Allow public read access to coupon codes (for validation)
CREATE POLICY "Allow public read coupon_codes" ON coupon_codes
    FOR SELECT USING (true);

-- Allow public update of coupon uses (decrement)
CREATE POLICY "Allow public update coupon_codes" ON coupon_codes
    FOR UPDATE USING (true);

-- Allow public insert/read/update on mcp_requests
CREATE POLICY "Allow public insert mcp_requests" ON mcp_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read mcp_requests" ON mcp_requests
    FOR SELECT USING (true);

CREATE POLICY "Allow public update mcp_requests" ON mcp_requests
    FOR UPDATE USING (true);

-- Allow public read on mcp_results
CREATE POLICY "Allow public insert mcp_results" ON mcp_results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read mcp_results" ON mcp_results
    FOR SELECT USING (true);

-- ===========================================
-- 6. Auto-update timestamp trigger
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mcp_requests_updated_at
    BEFORE UPDATE ON mcp_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Done! Your schema is ready.
-- ===========================================
