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

---

## Resource: Resep
Skema dokumen (MongoDB collection: `reseps` – nama pluralisasi otomatis Mongoose dari model `Resep`):
- _id: string (ObjectId)
- judul: string (required)
- deskripsi: string (optional)
- porsi: number (default 2)
- durasiMenit: number (default 30)
- tingkatKesulitan: enum: mudah | sedang | sulit (default mudah)
- perkiraanBiaya: number (Rupiah, default 0)
- ingredients: Array of object
  - nama: string (lowercase distored)
  - qty: number
  - unit: string (mis: gram, sdm, butir)
  - alternatif: string[] (opsional)
- langkahMasak: string[] (urutan langkah)
- nutrisi: { kalori?, protein?, karbo?, lemak? }
- tags: string[] (lowercase)
- gambar: string|null (nama file upload)
- createdAt / updatedAt: ISO date (otomatis oleh timestamps)

### GET /resep
Ambil semua resep.
- Query saat ini: (belum ada filter atau pagination) → akan mengembalikan seluruh koleksi.
- Response 200: array Resep.

### POST /resep
Buat resep baru.
- Content-Type: multipart/form-data
- Field teks dikirim sebagai bagian form-data (pastikan array dikirim sebagai JSON string jika pakai form biasa).
- Fields:
  - judul (required)
  - deskripsi
  - porsi
  - durasiMenit
  - tingkatKesulitan
  - perkiraanBiaya
  - ingredients (array JSON)
  - langkahMasak (array JSON)
  - nutrisi (object JSON)
  - tags (array JSON)
  - gambar (file opsional; field name: `gambar`)
- Response 201: objek Resep.
- Error 400: validasi/payload salah.

Contoh payload (form-data) untuk tools yang mendukung raw JSON pada field:
```
judul=Orak Arik Telur Tempe
deskripsi=Protein sederhana serbaguna
porsi=2
durasiMenit=15
tingkatKesulitan=mudah
perkiraanBiaya=12000
ingredients=[{"nama":"telur","qty":2,"unit":"butir"},{"nama":"tempe","qty":100,"unit":"gram"},{"nama":"daun bawang","qty":1,"unit":"batang"}]
langkahMasak=["Iris bahan","Tumis bumbu","Masukkan telur & tempe","Masak sampai matang"]
tags=["murah","protein","cepat"]
nutrisi={"kalori":320,"protein":22}
gambar=(file upload)
```

### GET /resep/{id}
Ambil satu resep berdasarkan id.
- Params: id
- Response 200: objek Resep.
- Error 404 jika tidak ditemukan.

### PATCH /resep/{id}
Update sebagian field resep (SAAT INI belum mendukung ganti gambar karena tidak ada multer di route PATCH).
- Content-Type: application/json
- Body: subset field di atas.
- Response 200: objek Resep terupdate.
- Error: 404 jika tidak ada, 400 jika invalid.

### DELETE /resep/{id}
Hapus resep.
- Response 200: `{ message: "Resep berhasil dihapus" }`
- Error 404: tidak ditemukan.

## Contoh Bentuk Data Resep (response)
```
{
  "_id": "66e07ab7c7...",
  "judul": "Orak Arik Telur Tempe",
  "deskripsi": "Protein sederhana serbaguna",
  "porsi": 2,
  "durasiMenit": 15,
  "tingkatKesulitan": "mudah",
  "perkiraanBiaya": 12000,
  "ingredients": [
    { "nama": "telur", "qty": 2, "unit": "butir", "alternatif": [] },
    { "nama": "tempe", "qty": 100, "unit": "gram", "alternatif": [] }
  ],
  "langkahMasak": ["Iris bahan", "Tumis bumbu", "Masukkan telur & tempe", "Masak sampai matang"],
  "nutrisi": { "kalori": 320, "protein": 22 },
  "tags": ["murah", "protein", "cepat"],
  "gambar": "1757250288651-FB_IMG_1625400911184.jpg",
  "createdAt": "2025-09-14T05:10:00.000Z",
  "updatedAt": "2025-09-14T05:10:00.000Z",
  "__v": 0
}
```

Bangun URL gambar resep:
```
const resepImgUrl = `${BASE_URL}/uploads/${resep.gambar}`;
```

## Batasan/Known Issues Tambahan (Resep)
- Tidak ada pagination & filter (rencana: ?bahan=telur,tempe & ?tag=protein & ?page=1&limit=10).
- Tidak ada endpoint kombinasi resep atau daftar belanja agregat (future feature).
- PATCH belum dukung ganti gambar.
- Validasi struktur `ingredients` tidak mendalam (misal unit konsisten) – tambahkan jika diperlukan.

## Rekomendasi Integrasi Frontend (Resep)
- Simpan array/objek (ingredients/langkahMasak/tags/nutrisi) sebagai JSON string saat kirim multipart.
- Parsing di frontend: pastikan lakukan JSON.parse pada field multi-value jika diperlukan sebelum edit ulang.
- Jika ingin edit + ganti gambar: sementara lakukan dua langkah (PATCH untuk teks lalu rencana endpoint khusus /resep/:id/gambar di masa depan).

---
Perubahan berikutnya: pagination, filter by bahan/tag, kombinasi resep, daftar belanja agregat, upload ganti gambar di PATCH.

---

## Frontend Test Client (AI Generated)
Untuk mempermudah tim menguji endpoint secara cepat, telah dibuat UI sederhana (React Create React App) yang bersifat sementara dan otomatis (AI generated). Lokasi: `Frontend/my_mbg/`.

Fitur yang dicakup:
- Tab Artikel: list, create (judul, isi, gambar), edit (teks + opsional ganti gambar), delete.
- Tab Resep: list, create (semua field termasuk ingredients/langkahMasak/nutrisi/tags sebagai JSON), edit, delete.
- Upload gambar langsung; URL gambar dibangun relatif `/uploads/{filename}`.

Batasan UI sementara:
- Validasi minimal (format JSON harus benar untuk array/object di Resep).
- Tidak ada pagination / filter.
- Tidak ada preview nutrisi terstruktur (hanya raw JSON object).
- Desain bukan final, hanya alat internal.

Cara menjalankan lokal:
1. Jalankan backend:
  - `cd Backend`
  - Pastikan MongoDB aktif (default localhost:27017)
  - `node index.js`
2. Jalankan frontend test client:
  - `cd Frontend/my_mbg`
  - `npm install` (sekali saja pertama kali)
  - `npm start`
3. Akses: http://localhost:3000 untuk backend API & http://localhost:3001 (atau port dev CRA yang muncul) untuk UI (proxy di `package.json` mengarahkan request API ke backend).

Catatan proxy:
- Field `proxy` di `Frontend/my_mbg/package.json` mengarah ke `http://localhost:3000` sehingga pemanggilan fetch relatif (mis: `/artikel`) akan diteruskan ke backend.

Penyesuaian lanjutan yang disarankan untuk tim frontend:
- Ganti mekanisme form JSON manual dengan form dinamis (array builder untuk ingredients/langkahMasak).
- Tambah handling error yang lebih ramah pengguna.
- Implementasi state management (misal React Query/Zustand) jika skala bertambah.
- Tambah komponen preview nutrisi.

DISCLAIMER: UI ini bukan bagian final produk; hanya utilitas internal untuk validasi cepat API. Silakan dibuang atau dirombak penuh ketika desain final siap.
