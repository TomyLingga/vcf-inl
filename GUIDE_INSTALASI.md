# Panduan Instalasi VCF System — PT. Industri Nabati Lestari

Dokumen ini berisi langkah-langkah untuk menyiapkan lingkungan pengembangan (development environment) untuk aplikasi VCF System, baik untuk Backend (Laravel) maupun Frontend (Next.js).

---

## Prasyarat
Sebelum memulai, pastikan perangkat Anda sudah terinstal:
- **PHP** (>= 8.1)
- **Composer**
- **Node.js** (>= 18)
- **MySQL** atau MariaDB atau postgress sql
- **Git**

---

## 1. Persiapan Backend (Laravel)

Pindah ke direktori `be`:
```bash
cd be
```

### Langkah-langkah:
1. **Instal Dependensi PHP**:
   ```bash
   composer install
   ```

2. **Setup Environment File**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Lalu sesuaikan konfigurasi database di file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=vcf_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. **Generate App Key**:
   ```bash
   php artisan key:generate
   ```

4. **Migrasi dan Seed Database**:
   Pastikan database (misal: `vcf_db`) sudah dibuat di MySQL, lalu jalankan:
   ```bash
   php artisan migrate --seed
   ```
   *Perintah ini akan membuat tabel dan mengisi data awal (user admin, master data, dll).*

5. **Jalankan Server Backend**:
   ```bash
   php artisan serve
   ```
   Server akan berjalan di `http://localhost:8000`.

---

## 2. Persiapan Frontend (Next.js)

Pindah ke direktori `fe`:
```bash
cd fe
```

### Langkah-langkah:
1. **Instal Dependensi Node.js**:
   ```bash
   npm install
   ```

2. **Setup Environment File**:
   Buat file `.env.local` (atau salin dari `.env.local.example` jika ada):
   ```bash
   cp .env.local.example .env.local
   ```
   Pastikan URL API mengarah ke server Laravel:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. **Jalankan Server Frontend**:
   ```bash
   npm run dev
   ```
   Aplikasi akan terbuka di `http://localhost:3000`.

---

## Akun Login Default
Setelah database berhasil di-seed, Anda dapat masuk menggunakan:
- **Username**: `admin`
- **Password**: `password` (atau cek di `DatabaseSeeder.php`)

---

## Troubleshooting
- **Build Error**: Jika muncul error `Module not found: Can't resolve 'qrcode'`, jalankan `npm install qrcode` di folder `fe`.
- **Database Connection**: Pastikan service MySQL sudah berjalan sebelum melakukan migrasi.
- **CORS Issues**: Jika frontend gagal mengambil data, pastikan `CORS_ALLOWED_ORIGINS` di backend sudah mengizinkan `http://localhost:3000`.
