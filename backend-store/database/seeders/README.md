# Database Seeders Documentation

Dokumen ini menjelaskan semua seeder yang tersedia dalam aplikasi store-agent.

## Daftar Seeder

### 1. DatabaseSeeder

Seeder utama yang memanggil semua seeder lainnya dalam urutan yang benar.

**Urutan Seeding:**

1. UserSeeder - Membuat user admin dan agent
2. CitySeeder - Membuat data kota-kota di Indonesia
3. EWalletSeeder - Membuat data e-wallet dan metode pembayaran
4. GameSeeder - Membuat data game dan item game
5. KuotaSeeder - Membuat data paket kuota internet
6. PulsaSeeder - Membuat data pulsa
7. TokenSeeder - Membuat data token listrik PLN
8. BusSeeder - Seeder untuk rute bus (akan diimplementasikan nanti)

### 2. UserSeeder

Membuat user default untuk aplikasi:

-   **Admin User:**
    -   Email: admin@admin.com
    -   Password: password123
    -   Role: admin
-   **Agent Users:** 5 user agent yang dibuat menggunakan factory

### 3. CitySeeder

Membuat 15 kota utama di Indonesia dengan provinsi masing-masing:

-   Jakarta, Surabaya, Bandung, Medan, Makassar
-   Semarang, Palembang, Balikpapan, Manado, Denpasar
-   Yogyakarta, Malang, Padang, Pekanbaru, Pontianak

### 4. EWalletSeeder

Membuat 8 metode pembayaran:

-   DANA, OVO, GoPay, ShopeePay, LinkAja
-   QRIS, Bank Transfer, Cash

### 5. GameSeeder

Membuat data game populer dengan item dan harga:

-   **Genshin Impact:** Genesis Crystal (60, 300+30, 980+110, 1980+260)
-   **Honkai Star Rail:** Oneiric Shard (60, 300+30, 980+110)
-   **Zenless Zone Zero:** Premium Currency (60, 300+30)
-   **Blue Archive:** Pyroxene (490, 1200+300)
-   **Azur Lane:** Gems (300, 600)
-   **Arknights:** Originium (60, 185+25)
-   **Fate Grand Order:** Saint Quartz (12, 30)
-   **Guardian Tales:** Gems (300, 1200)
-   **Wuthering Waves:** Astrite (300, 980)
-   **Uma Musume:** Jewel (1500, 5000)

### 6. KuotaSeeder

Membuat paket kuota internet dari 5 provider:

-   **Telkomsel:** 1GB, 2GB, 5GB, 10GB (30 hari)
-   **XL:** 1GB, 2GB, 5GB, 10GB (30 hari)
-   **Indosat:** 1GB, 2GB, 5GB, 10GB (30 hari)
-   **Tri:** 1GB, 2GB, 5GB, 10GB (30 hari)
-   **Smartfren:** 1GB, 2GB, 5GB, 10GB (30 hari)

### 7. PulsaSeeder

Membuat data pulsa dari 5 provider:

-   **Telkomsel:** 5K, 10K, 20K, 25K, 50K, 100K
-   **XL:** 5K, 10K, 20K, 25K, 50K, 100K
-   **Indosat:** 5K, 10K, 20K, 25K, 50K, 100K
-   **Tri:** 5K, 10K, 20K, 25K, 50K, 100K
-   **Smartfren:** 5K, 10K, 20K, 25K, 50K, 100K

### 8. TokenSeeder

Membuat token listrik PLN:

-   20K → 13.2 kWh
-   50K → 33.0 kWh
-   100K → 66.0 kWh
-   200K → 132.0 kWh
-   500K → 330.0 kWh
-   1M → 660.0 kWh

## Cara Menjalankan Seeder

### Menjalankan Semua Seeder

```bash
php artisan db:seed
```

### Menjalankan Seeder Tertentu

```bash
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=CitySeeder
php artisan db:seed --class=GameSeeder
```

### Reset Database dan Jalankan Seeder

```bash
php artisan migrate:fresh --seed
```

## Catatan Penting

1. **Urutan Seeding:** Pastikan urutan seeding di DatabaseSeeder sudah benar untuk menghindari error foreign key constraint.

2. **Data Duplikasi:** Semua seeder menggunakan `firstOrCreate()` untuk menghindari data duplikasi.

3. **Factory:** UserSeeder menggunakan factory untuk membuat user agent, pastikan UserFactory sudah dikonfigurasi dengan benar.

4. **Harga:** Semua harga dalam Rupiah (IDR) dan disimpan sebagai decimal dengan 2 angka di belakang koma.

5. **Status Aktif:** Semua item defaultnya aktif (`is_active = true`).

## Troubleshooting

### Error "Class not found"

Pastikan semua model yang direferensikan dalam seeder sudah ada dan namespace-nya benar.

### Error "Table doesn't exist"

Pastikan semua migration sudah dijalankan sebelum menjalankan seeder.

### Error "Column not found"

Pastikan nama field dalam seeder sesuai dengan struktur tabel di migration.
