-- ============================================
-- MIGRATION: DAPUR UMKM (Management System)
-- Created: December 6, 2025
-- Description: Database schema for UMKM management including profiles, products, transactions, and AI insights
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: UMKM Profiles (Business Identity)
-- ============================================
CREATE TABLE IF NOT EXISTS umkm_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Kuliner / Makanan',
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    established_date DATE,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: UMKM Products (Menu/Inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS umkm_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES umkm_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    category VARCHAR(100),
    description TEXT,
    cost_price NUMERIC(15, 2) DEFAULT 0, -- Harga pokok (untuk profit analysis)
    is_available BOOLEAN DEFAULT TRUE,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: UMKM Transactions (Finance Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS umkm_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES umkm_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
    category VARCHAR(100), -- 'sales', 'expenses', 'operational', 'inventory'
    product_id UUID REFERENCES umkm_products(id) ON DELETE SET NULL,
    notes TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 4: AI Insights (Kolosal Llama Recommendations)
-- ============================================
CREATE TABLE IF NOT EXISTS umkm_ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES umkm_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'pricing', 'inventory', 'strategy', 'marketing'
    question TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    context_data JSONB, -- Store business metrics used for recommendation
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performance Optimization)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_user ON umkm_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_umkm_products_profile ON umkm_products(profile_id);
CREATE INDEX IF NOT EXISTS idx_umkm_products_user ON umkm_products(user_id);
CREATE INDEX IF NOT EXISTS idx_umkm_transactions_profile ON umkm_transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_umkm_transactions_user ON umkm_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_umkm_transactions_date ON umkm_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_umkm_transactions_type ON umkm_transactions(type);
CREATE INDEX IF NOT EXISTS idx_umkm_ai_insights_profile ON umkm_ai_insights(profile_id);

-- ============================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_umkm_profiles_updated_at
    BEFORE UPDATE ON umkm_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_umkm_products_updated_at
    BEFORE UPDATE ON umkm_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_umkm_transactions_updated_at
    BEFORE UPDATE ON umkm_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================
ALTER TABLE umkm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm_ai_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profiles" ON umkm_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own products" ON umkm_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON umkm_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own AI insights" ON umkm_ai_insights FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own profiles" ON umkm_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON umkm_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON umkm_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI insights" ON umkm_ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profiles" ON umkm_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON umkm_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON umkm_transactions FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own products" ON umkm_products FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON umkm_transactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PUBLIC ACCESS (for development/testing without auth)
-- Remove these policies in production
-- ============================================
CREATE POLICY "Enable public read for profiles (DEV)" ON umkm_profiles FOR SELECT USING (true);
CREATE POLICY "Enable public insert for profiles (DEV)" ON umkm_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public update for profiles (DEV)" ON umkm_profiles FOR UPDATE USING (true);

CREATE POLICY "Enable public read for products (DEV)" ON umkm_products FOR SELECT USING (true);
CREATE POLICY "Enable public insert for products (DEV)" ON umkm_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public update for products (DEV)" ON umkm_products FOR UPDATE USING (true);
CREATE POLICY "Enable public delete for products (DEV)" ON umkm_products FOR DELETE USING (true);

CREATE POLICY "Enable public read for transactions (DEV)" ON umkm_transactions FOR SELECT USING (true);
CREATE POLICY "Enable public insert for transactions (DEV)" ON umkm_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public update for transactions (DEV)" ON umkm_transactions FOR UPDATE USING (true);
CREATE POLICY "Enable public delete for transactions (DEV)" ON umkm_transactions FOR DELETE USING (true);

CREATE POLICY "Enable public read for AI insights (DEV)" ON umkm_ai_insights FOR SELECT USING (true);
CREATE POLICY "Enable public insert for AI insights (DEV)" ON umkm_ai_insights FOR INSERT WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

-- INSERT INTO umkm_profiles (business_name, category, address, phone, description)
-- VALUES (
--     'Warung Coto Daeng',
--     'Kuliner / Makanan',
--     'Jl. A.P. Pettarani No. 102, Makassar',
--     '081234567890',
--     'Warung coto khas Makassar dengan resep turun temurun'
-- );

-- ============================================
-- VIEWS (Optional - for reporting)
-- ============================================
CREATE OR REPLACE VIEW umkm_financial_summary AS
SELECT 
    profile_id,
    user_id,
    SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) AS total_expense,
    SUM(CASE WHEN type = 'in' THEN amount ELSE -amount END) AS balance,
    COUNT(*) AS total_transactions,
    MAX(transaction_date) AS last_transaction_date
FROM umkm_transactions
GROUP BY profile_id, user_id;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ DAPUR UMKM Migration completed successfully!';
    RAISE NOTICE '📋 Tables created: umkm_profiles, umkm_products, umkm_transactions, umkm_ai_insights';
    RAISE NOTICE '🔒 RLS policies enabled (with public access for dev)';
    RAISE NOTICE '📊 Financial summary view created';
    RAISE NOTICE '🚀 Ready to use!';
END $$;
