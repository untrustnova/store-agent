# Catatan

## Bagian Backend

Adanya masalah seperti delay pada vendor [vendor\andrazero121\api-resource-typer\src\Providers]

## Route/Pages

**Dasar:**

- [X] `/` : Home
- [X] `/auth/login` : Authorization (Perizinan Token) - [ ] Login
- [X] `/auth/register` : Authorization (Perizinan Token) - [ ] Register

**Transaksi:**

- [ ] `/transaction/pulsa` : Pembayaran Pulsa `pulsa`
- [ ] `/transaction/bus` : Pembayaran Bus `bus`
- [ ] `/transaction/e-wallet` : Pembayaran E-Wallet `ewallet`
- [ ] `/transaction/internet` : Pembayaran Internet `internet`
- [ ] `/transaction/game` : Pembayaran Game `game`
- [ ] `/transaction/pln` : Pembayaran Token Listrik (PLN) `token`

**Akun:**

- [X] `/account` : Profil Pengguna
- [ ] `/account/transaction-history` : Riwayat Transaksi
- [ ] `/account/transaction-status/:slug` : Status Transaksi

**Admin:**

- [ ] `/admin` : Dashboard Admin
- [ ] `/admin/users` : List Users + Update User
