-- 1. Buat Tabel Categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert Data Kategori Default
INSERT INTO categories (name) VALUES ('Makanan'), ('Minuman'), ('Cemilan'), ('Dessert');

-- 2. Buat Tabel Products
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert Sample Products
INSERT INTO products (name, category_id, price, stock, image_url) VALUES
('Nasi Goreng Spesial', 1, 25000, 50, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'),
('Ayam Bakar Madu', 1, 30000, 30, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400'),
('Es Teh Manis', 2, 5000, 100, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
('Kopi Susu Gula Aren', 2, 18000, 80, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400'),
('Kentang Goreng (French Fries)', 3, 15000, 40, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400');

-- 3. Buat Tabel Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) DEFAULT 'Guest',
    order_type VARCHAR(20) DEFAULT 'Dine-In', -- 'Dine-In' / 'Takeaway'
    table_number VARCHAR(10),
    total_amount DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'Cash', -- 'Cash', 'QRIS', 'Transfer'
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Buat Tabel Order Items
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

-- Enable RLS (Row Level Security) - Permissive untuk Demo
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON order_items FOR SELECT USING (true);

CREATE POLICY "Allow full access to authenticated users" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access to authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow full access on orders to auth" ON orders FOR ALL USING (auth.role() = 'authenticated');