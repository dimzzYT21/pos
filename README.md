# Modern Point of Sale (POS) & Customer Ordering System

A full-stack, responsive POS application built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase (PostgreSQL + Auth)**. Ready to deploy on **Vercel** and connected via **GitHub**.

---

## 📋 Daftar Isi / Table of Contents
1. [Fitur Utama (Features)](#-fitur-utama-features)
2. [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
3. [Skema Database Supabase (SQL Schema)](#-skema-database-supabase-sql-schema)
4. [Langkah-Langkah Implementasi Lengkap](#-langkah-langkah-implementasi-lengkap)
   - [Langkah 1: Setup Supabase Database & Auth](#langkah-1-setup-supabase-database--auth)
   - [Langkah 2: Setup GitHub Repository](#langkah-2-setup-github-repository)
   - [Langkah 3: Deploy ke Vercel](#langkah-3-deploy-ke-vercel)
5. [Menjalankan Project di Local (Development)](#-menjalankan-project-di-local-development)
6. [Panduan Penggunaan Fitur](#-panduan-penggunaan-fitur)
   - [Print Struk (Thermal Printer / Standard)](#1-print-struk-thermal-printer--standard)
   - [Riwayat Pesanan & Laporan](#2-riwayat-pesanan--laporan)

---

## 🚀 Fitur Utama (Features)

### 🛒 Frontend Kostumer (Customer Self-Service / Catalog)
- **Katalog Produk Interactive**: Pilihan kategori, pencarian, dan penambahan item ke keranjang belanja (cart).
- **Manajemen Keranjang (Cart)**: Tambah/kurang jumlah, hapus item, hitung otomatis subtotal, pajak (PPN 11%), dan total.
- **Pilihan Tipe Pesanan**: Dine-in (Makan di tempat) atau Takeaway (Bawa pulang) serta nomor meja.
- **Checkout & Struk**: Konfirmasi pemesanan langsung menghasilkan struk/nota belanja.

### 🔐 Admin Dashboard & Kasir
- **Sistem Otentikasi**: Login khusus Admin/Kasir menggunakan Supabase Auth (Email & Password).
- **Dashboard Analistik**: Ringkasan penjualan hari ini, total pesanan, produk terlaris, dan grafik statistik.
- **Kasir (POS Mode)**: Interface kasir cepat untuk melayani transaksi di tempat secara langsung.
- **Riwayat Pesanan (Order History)**: Filter pesanan berdasarkan status (`pending`, `completed`, `cancelled`), tanggal, dan metode pembayaran.
- **Manajemen Produk (CRUD)**: Tambah, edit, hapus produk, kustomisasi harga, stok, dan kategori.
- **Cetak Struk (Thermal Printer Support)**: Dukungan cetak nota fisik dengan format struk kasir 58mm / 80mm menggunakan browser print API CSS optimized.

---

## 📁 Arsitektur & Struktur Folder

```
pos-app/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── schema.sql
├── README.md
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js                 # Frontend Kostumer (Pemesanan)
│   │   ├── login/
│   │   │   └── page.js             # Halaman Login Admin
│   │   ├── admin/
│   │   │   ├── layout.js           # Admin Sidebar & Topbar Layout
│   │   │   ├── page.js             # Dashboard Utama & Analistik
│   │   │   ├── pos/
│   │   │   │   └── page.js         # Interface Kasir (POS)
│   │   │   ├── orders/
│   │   │   │   └── page.js         # Riwayat Pesanan & Detail Struk
│   │   │   └── products/
│   │   │       └── page.js         # Manajemen Produk
│   ├── lib/
│   │   └── supabase.js             # Client Supabase Config
│   └── components/
│       ├── Receipt.js              # Komponen Struk Siap Cetak
│       ├── Navbar.js               # Navigation Bar
│       └── Sidebar.js              # Admin Navigation Sidebar
```

---

## 🗄️ Skema Database Supabase (SQL Schema)

Jalankan perintah SQL berikut di **Supabase SQL Editor** untuk membuat tabel, relasi, dan RLS (Row Level Security):

```sql
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
```

---

## 🛠️ Langkah-Langkah Implementasi Lengkap

### Langkah 1: Setup Supabase Database & Auth
1. Buka [Supabase Dashboard](https://supabase.com/) dan buat project baru.
2. Ke menu **SQL Editor**, salin script SQL di atas dan klik **Run**.
3. Ke menu **Authentication -> Users**, tambahkan User Admin baru (contoh: `admin@pos.com` / Password: `password123`).
4. Ke menu **Project Settings -> API**, catat:
   - `Project URL` (URL API)
   - `anon public key` (API Key Publik)

---

### Langkah 2: Setup GitHub Repository
1. Buat Repository baru di GitHub (misal: `my-pos-app`).
2. Ekstrak file zip project ini di komputer Anda.
3. Jalankan perintah git berikut pada terminal komputer Anda:
   ```bash
   cd pos-app
   git init
   git add .
   git commit -m "Initial POS system commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/my-pos-app.git
   git push -u origin main
   ```

---

### Langkah 3: Deploy ke Vercel
1. Login/Daftar ke [Vercel](https://vercel.com/).
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repository `my-pos-app`.
4. Pada bagian **Environment Variables**, tambahkan dua variabel berikut dari Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL` = `<URL_PROJECT_SUPABASE_ANDA>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<ANON_KEY_SUPABASE_ANDA>`
5. Klik **Deploy**. Dalam 1-2 menit, aplikasi POS Anda sudah online!

---

## 💻 Menjalankan Project di Local (Development)

1. Pastikan Node.js (v18 atau lebih baru) sudah terpasang.
2. Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env.local` dan isi dengan konfigurasi Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Jalankan server lokal:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🖨️ Panduan Penggunaan Fitur

### 1. Print Struk (Thermal Printer / Standard)
- Fitur cetak nota telah dilengkapi styling khusus CSS `@media print`.
- Ketika menekan tombol **"Cetak Struk"** pada halaman checkout atau riwayat pesanan:
  - Browser akan membuka dialog cetak.
  - Elemen navigasi, sidebar, dan tombol akan otomatis disembunyikan.
  - Struk terformat rapi dalam lebar standar kasir (58mm/80mm).

### 2. Riwayat Pesanan & Laporan
- Masuk ke Admin Dashboard -> **Riwayat Pesanan**.
- Anda dapat melihat status transaksi, metode pembayaran, serta perincian item.
- Klik **"Detail / Struk"** untuk melakukan re-print struk transaksi kapan saja.
