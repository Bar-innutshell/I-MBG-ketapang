# Backend API – I‑MBG Ketapang

Dokumentasi ringkas untuk tim Frontend agar mudah mengintegrasikan API backend.

## Dasar
- Base URL (local): http://localhost:3000
- Format default: JSON (kecuali upload gambar menggunakan multipart/form-data)
- CORS: diaktifkan untuk semua origin
- Static files (gambar): GET /uploads/{filename}

## Resource: Artikel
Skema dokumen (MongoDB collection: `artikels`):
- _id: string (ObjectId)
- judul: string (required)
- isi: string (required)
- gambar: string | null (nama file yang disimpan di folder `uploads/`)
- Tanggal: string (ISO date, default dari server)

Catatan penting gambar:
- Field `gambar` di database berisi hanya nama file, bukan URL penuh.
- Untuk menampilkan di frontend: gambarUrl = `${BASE_URL}/uploads/${gambar}`.

### GET /artikel
Ambil semua artikel.
- Request: tidak ada parameter/body.
- Response 200: array of Artikel.

### POST /artikel
Buat artikel baru (dengan/atau tanpa gambar).
- Content-Type: multipart/form-data
- Fields:
  - judul: string (required)
  - isi: string (required)
  - gambar: file (opsional) — field name harus `gambar`
- Response 201: objek Artikel yang tersimpan.
- Error: 400 jika payload tidak valid.

### GET /artikel/{id}
Ambil satu artikel berdasarkan `id`.
- Params: `id` (string ObjectId)
- Response 200: objek Artikel.
- Error: 404 jika tidak ditemukan.

### PATCH /artikel/{id}
Update sebagian field artikel (tanpa dukungan ganti gambar untuk saat ini).
- Content-Type: application/json
- Body (opsional, salah satu atau kombinasi):
  - judul: string
  - isi: string
  - gambar: string (tidak dianjurkan — upload belum didukung di PATCH)
- Response 200: objek Artikel hasil update.
- Error: 404 jika `id` tidak ditemukan, 400 jika payload tidak valid.

### DELETE /artikel/{id}
Hapus artikel.
- Response 200: `{ message: "Artikel berhasil dihapus" }`
- Error: 404 jika `id` tidak ditemukan.

## Contoh bentuk data (ringkas)
Artikel (response):
```
{
  "_id": "66e049e0c7...",
  "judul": "Judul Artikel",
  "isi": "Isi artikel...",
  "gambar": "1757250288651-FB_IMG_1625400911184.jpg", // bisa null
  "Tanggal": "2025-09-10T05:10:00.000Z",
  "__v": 0
}
```
Bangun URL gambar di frontend jika `gambar` tidak null:
```
const url = `${BASE_URL}/uploads/${artikel.gambar}`;
```

## Status & Error
- 200 OK: permintaan berhasil
- 201 Created: berhasil membuat resource
- 400 Bad Request: validasi/payload salah
- 404 Not Found: resource tidak ditemukan
- 500 Internal Server Error: kesalahan server

Catatan: sebagian pesan error masih menggunakan bahasa informal; gunakan kode status HTTP untuk alur UI.

## Catatan Teknis
- Server: Express pada port 3000
- Database: MongoDB local (Mongoose). Tanpa nama DB eksplisit → default Mongo `test`.
- Upload: Multer menyimpan file ke folder `Backend/uploads/` dengan nama `Date.now() + '-' + originalname`.
- Static: Folder `uploads/` disajikan di `/uploads` (public).

## Batasan/Known Issues (per 2025-09-10)
- PATCH belum mendukung update file gambar (tidak ada middleware upload pada route ini).
- Tidak ada pagination/sorting/filter di listing artikel.
- Tidak ada autentikasi/otorisasi.

## Rekomendasi Integrasi Frontend
- Untuk daftar: konsumsi `GET /artikel` lalu bangun URL gambar per item jika `gambar` ada.
- Untuk detail: gunakan `GET /artikel/{id}` dan tampilkan gambar dari `/uploads/{filename}` bila tersedia.
- Untuk create: kirim `multipart/form-data` dengan field `judul`, `isi`, dan file `gambar` opsional.
- Untuk update teks: gunakan `PATCH /artikel/{id}` dengan JSON; hindari mengganti `gambar` sampai dukungan upload di PATCH tersedia.

---
Dokumentasi ini akan diperbarui saat endpoint baru ditambahkan (mis. detail artikel, pagination, update gambar).
