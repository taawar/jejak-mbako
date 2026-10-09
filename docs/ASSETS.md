# Aset revisi visual — 9 Oktober 2026

Revisi ini mengikuti permintaan pengguna untuk memasang enam foto, menggabungkan alun-alun dan tugu jam sebagai latar pembuka, serta membuat konsep original untuk bab 5. Ini penyesuaian visual setelah fase 1; peta, hotspot motif, dan stepper fase 2 belum dikerjakan.

## Daftar aset

Seluruh file berada di `public/assets/images/`. Enam file kiriman disalin apa adanya dari lampiran, tanpa menghapus tulisan atau watermark. Sumber asli, fotografer, lokasi pengambilan, serta izin penggunaan foto belum disediakan; status foto tetap `sementara` sampai dikonfirmasi. Ini tidak menyatakan bahwa foto adalah karya pengguna atau bebas lisensi.

| File | Asal dan penggunaan |
| --- | --- |
| `bab-1-dua-gunung.png` | Lampiran 1, foto 350 × 262; ditampilkan selebar bab 1, dengan tulisan aslinya tetap ada. Resolusi membatasi ketajaman. |
| `bab-2-daun-tembakau.png` | Lampiran 2, foto 702 × 465; digunakan untuk bab 2 tanpa klaim lokasi spesifik. |
| `bab-3-pengrajin.png` | Lampiran 3, foto 1200 × 800; digunakan untuk bab 3, mempertahankan watermark, tanpa menebak identitas orang, asal motif, atau lokasi kegiatan. |
| `bab-4-detail-kain.png` | Lampiran 4, foto 225 × 225; ditampilkan sebagai crop lanskap detail kain, bukan dokumentasi proses atau motif original aplikasi. Foto utuh tersedia melalui Tentang foto. |
| `alun-alun-referensi.png` | Lampiran 5; foto dasar kolase hero serta foto pembuka bab 5. |
| `tugu-jam-referensi.png` | Lampiran 6; objek pendukung kolase hero, salinan asal disimpan untuk penelusuran. |
| `hero-temanggung-kolase.png` | Hasil compositing dengan tool imagegen bawaan, 1536 × 1024; latar pembuka yang menggabungkan alun-alun dan tugu jam secara kreatif. |

Hero diberi label **kolase kreatif berbantuan AI**. Posisi objek dalam gambar tidak menunjukkan posisi geografis sebenarnya. Hasil AI dapat mengubah detail kecil bangunan dan bukan bukti sejarah atau dokumentasi lokasi. Dua sumber foto tetap memerlukan kredit/izin yang sesuai.

File kolase dibuat non-destruktif; dua foto asal dipertahankan. Salinan hasil disimpan dalam proyek sehingga aplikasi tidak bergantung pada folder sementara atau lokasi output tool.

## Konsep original bab 5

Bab 5 memakai foto alun-alun, narasi dengan rujukan, serta komposisi tipografi HTML/CSS: **Cerita berikutnya, kamu yang menulis.** Tiga panel `details` berjudul Dengar, Catat, dan Ceritakan dapat dibuka dengan mouse, sentuhan, Enter, atau Space. Isinya adalah ajakan berkegiatan, bukan klaim fakta sejarah atau kutipan orang nyata. Tidak ada foto baru atau penyimpanan data tambahan.

Teks berada pada `bab[4].manifesto` di `data/story.json`, sehingga mudah diganti. `renderManifesto()` membuat elemen DOM melalui `textContent`. `visual: "manifesto"` menambahkan komposisi ini sesudah narasi. Revisi keterbacaan memakai font sistem sans-serif dan palet putih tulang, arang, serta biru yang dipilih pengguna.

## Interaksi hero

Nama lokasi muncul melalui selector CSS `:hover`, `:focus-visible`, dan `[aria-expanded='true']`. Klik/sentuh membuka uraian; klik kedua, tombol Tutup, atau Escape menutupnya. Efek gerak gambar hanya aktif di desktop dengan pointer presisi serta `prefers-reduced-motion: no-preference`.

Posisi hotspot mengikuti area gambar berasio 3:2. Di layar sampai 1100 piksel, teks berada di atas foto agar kedua landmark tetap terlihat utuh dan hotspot tetap mudah disentuh.

## Prompt final dan alat

Pengujian revisi: delapan tes backend tetap lulus. Lima bab kini memiliki foto dan narasi. Viewport 360 dan 768 piksel tidak menunjukkan luapan horizontal. Escape menutup panel hotspot dan mengembalikan fokus serta label Tugu Jam. Panel Dengar pada bab 5 terbuka dengan isi yang sesuai. Konsol browser tidak mencatat error atau warning pada pemeriksaan. Tampilan desktop 1440 piksel juga diperiksa secara visual. Ketajaman gambar kecil tetap mengikuti resolusi asal; tidak dilakukan generasi ulang atau pengubahan isi foto pada revisi tipografi.

Alat: **imagegen bawaan**, mode edit/compositing; bukan CLI. Input pertama adalah foto alun-alun, input kedua foto tugu jam. Prompt final:

> Use case: compositing. Asset type: background photograph collage for the Jejak Mbako cultural storytelling website. Input image 1 is the base alun-alun photo with the red TEMANGGUNG BERSENYUM lettering. Input image 2 is the supporting insert of the clock monument. Merge both into one refined, wide 3:2 landscape editorial photographic collage. Preserve the recognizable alun-alun trees, stone wall, red lettering exactly 'TEMANGGUNG BERSENYUM', statue, and the exact stepped white clock tower with orange trim and green triangle base. Keep the monument fully visible vertically at the rightmost quarter (center x around 80%), the red lettering in the lower middle left (center around x=43%, y=68%), green canopy framing the upper left, clear open pale blue sky toward the center. Visually join the foreground pavement with matched daylight, moderate muted warm-green cinematic color grading, believable perspective. It is an explicitly labeled creative montage, not a claim of geographical co-location. Do not add new buildings or landmarks, people, extra signs, captions, logos, UI, buttons, typography, decorative frames, or watermarks. Keep original landmark appearances intact. Photo-based, not illustrated, no painterly treatment. The website will overlay its own title and interactive labels. Deliver a polished landscape image only.
