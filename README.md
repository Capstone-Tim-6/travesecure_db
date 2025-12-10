# TravSecure API

Dokumentasi API untuk aplikasi backend TravSecure.

## Instalasi

1. **Clone repository:** (jika belum clone, jika sudah langsung buka file saja)
```bash
   git clone <repository-url> 
   cd travsecure-backend
```

2. **Install dependensi:**
```bash
   npm install
```

3. **Siapkan database:**
   - Pastikan PostgreSQL sudah terinstal dan berjalan.
   - Buat database baru, misalnya `travsecure_db`.

4. **Konfigurasi variabel environment:**
   - Salin file `.env.example` menjadi file baru bernama `.env`.
   - Buka file `.env` dan perbarui `DATABASE_URL` dengan string koneksi database Anda.
   - Perbarui variabel lainnya sesuai kebutuhan.

5. **Jalankan migrasi database:**
```bash
   npm run migrate up
```

6. **Seed database (opsional):**
```bash
   npm run db:seed
```

## Menjalankan aplikasi
```bash
npm start
```

API akan tersedia di `http://localhost:3000/api`.

## Dokumentasi API

Dokumentasi API tersedia di `http://localhost:3000/api-docs`.