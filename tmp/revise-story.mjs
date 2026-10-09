import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../data/story.json', import.meta.url);
const story = JSON.parse(readFileSync(path, 'utf8'));
story.meta.versi = '0.2.0';
story.meta.verifikasi = 'Narasi bab 1–5 ditelusuri pada 9 Oktober 2026. Rujukan dicantumkan pada paragraf terkait; kredit foto dan informasi yang belum didukung sumber tetap perlu dikonfirmasi.';
story.hero.subjudul = 'Kenali tempatnya.\nTemukan ceritanya.';
story.hero.deskripsi = 'Dari lereng Sumbing–Sindoro ke sehelai kain. Ikuti lima bab tentang alam, kerja, dan kreativitas yang tumbuh di Temanggung.';
story.hero.hotspot[0].teks = 'Mulai dari ruang bersama. Foto alun-alun dengan tulisan Temanggung Bersenyum mengantar kita mengenal tempat, lalu orang dan karya di baliknya. Latar ini adalah kolase; letak tugu terhadap alun-alun tidak menunjukkan posisi sebenarnya.';

const narratives = [
  {
    ringkasan: 'Sebelum mengenal kainnya, mari mengenal tempat sebuah cerita tumbuh.',
    isi: [
      { teks: 'Temanggung berada di antara Gunung Sumbing dan Sindoro. Bentang inilah yang menjadi titik berangkat perjalanan kita: melihat daerah melalui lanskapnya, sebelum mendekat pada kehidupan masyarakatnya.', sumberIds: ['pemkab-lanskap'] },
      { teks: 'Pada foto di atas, jalan membelah hamparan lahan dengan dua gunung di kejauhan. Cobalah mengikuti jalan itu dengan pandanganmu. Dari pemandangan yang luas, perhatian kita perlahan turun ke kebun, tanaman, dan pekerjaan sehari-hari.', sumberIds: [] },
      { teks: 'Cerita sebuah daerah tidak hanya tersimpan pada bangunan atau peristiwa besar. Ia juga dapat ditemukan pada hal yang berulang: benda yang digunakan, pekerjaan yang ditekuni, dan bentuk alam yang akrab dilihat.', sumberIds: [] },
      { teks: 'Jejak Mbako mengajakmu mulai dari rasa ingin tahu itu. Setelah mengenal tempatnya, sekarang kita mendekat pada salah satu unsur yang kelak hadir di atas kain: sehelai daun.', sumberIds: [] }
    ],
    fakta: [{ teks: 'Temanggung diapit Gunung Sumbing dan Sindoro.', status: 'didukung-sumber', sumberIds: ['pemkab-lanskap'] }],
    renungan: 'Apa satu pemandangan di daerahmu yang langsung membuatmu merasa pulang?'
  },
  {
    ringkasan: 'Di balik tanaman yang terlihat, ada pengetahuan dan pekerjaan yang terus dirawat.',
    isi: [
      { teks: 'Tembakau dan kopi merupakan bagian penting dari cerita pertanian Temanggung. Dalam pemberitaan pemerintah daerah pada 2023, keduanya disebut sebagai komoditas unggulan; pembahasannya juga menekankan pekerjaan dari budidaya hingga pengolahan dan pemasaran.', sumberIds: ['pemkab-kopi'] },
      { teks: 'Melihat daun dari dekat memberi sudut pandang berbeda. Permukaan, tepi, dan garis tulangnya membentuk susunan yang bisa diamati. Di tangan seorang perupa, bentuk yang sehari-hari terlihat dapat menjadi awal sebuah gagasan visual.', sumberIds: [] },
      { teks: 'Hubungan itu tampak pada Batik Mbako. Kajian desain tahun 2019 menjelaskan bahwa tanaman tembakau dan kegiatan pertaniannya menjadi unsur pembentuk motif. Inspirasi tidak berhenti pada daunnya, tetapi juga menjangkau benda serta aktivitas di sekitarnya.', sumberIds: ['bcm-motif'] },
      { teks: 'Dari sini, perjalanan kita beralih dari tanaman menuju kreativitas. Bagaimana sesuatu yang tumbuh di kebun dapat diceritakan kembali melalui kain?', sumberIds: [] }
    ],
    fakta: [{ teks: 'Tembakau dan kopi disebut sebagai komoditas Temanggung; tanaman dan aktivitas pertanian menjadi inspirasi Batik Mbako.', status: 'didukung-sumber', sumberIds: ['pemkab-kopi', 'bcm-motif'] }],
    renungan: 'Kalau mengamati satu daun, bagian mana yang ingin kamu gambar terlebih dahulu?'
  },
  {
    ringkasan: 'Pada 2009, sebuah gagasan lokal mulai menemukan bentuknya dalam batik.',
    isi: [
      { teks: 'Penelitian sejarah Batik Mbako mengaitkan awal usaha ini pada 2009 dengan Iman Nugroho. Daun tembakau serta hal-hal yang berhubungan dengan tanaman itu menjadi inspirasi untuk mengembangkan identitas batik dari Temanggung.', sumberIds: ['islah'] },
      { teks: 'Kajian desain Batik Mbako menyebut Ron Mbako, yang merujuk pada daun tembakau, dan Rigen Mbako. Rigen adalah alat untuk menjemur tembakau. Nama-nama ini memperlihatkan bagaimana benda yang dekat dengan keseharian dapat masuk ke bahasa visual kain.', sumberIds: ['bcm-motif'] },
      { teks: 'Cerita itu juga menyangkut orang yang mengerjakannya. Penelitian di Tegaltemu mencatat perkembangan dari industri rumahan serta peran kegiatan membatik dalam membuka pekerjaan dan membantu ekonomi keluarga.', sumberIds: ['islah'] },
      { teks: 'Ketika melihat sehelai batik, kita bisa belajar bertanya lebih jauh: siapa yang membuatnya, apa yang menjadi inspirasinya, dan bagaimana prosesnya? Pertanyaan itu membawa kita ke bab berikutnya.', sumberIds: [] }
    ],
    fakta: [{ teks: 'Iman Nugroho, awal usaha pada 2009, serta peran ekonomi di Tegaltemu didukung kajian sejarah; nama Ron Mbako dan Rigen Mbako dibahas kajian desain.', status: 'didukung-sumber', sumberIds: ['islah', 'bcm-motif'] }],
    renungan: 'Benda sehari-hari apa di sekitarmu yang layak diangkat menjadi cerita sebuah karya?'
  },
  {
    ringkasan: 'Sebuah pola menjadi batik melalui kerja tangan, perintang warna, dan proses yang berulang.',
    isi: [
      { teks: 'Dalam penjelasan UNESCO tentang batik Indonesia, malam atau lilin panas digunakan untuk menahan warna pada bagian kain tertentu. Kain kemudian diberi warna, dan malam dilepaskan dengan air panas. Tahapan dapat diulang ketika pembuat menginginkan beberapa warna.', sumberIds: ['unesco-batik'] },
      { teks: 'Kajian Batik Mbako mencatat penggunaan teknik tulis dan cap. Teknik serta pilihan warna memberi ruang bagi pengrajin untuk menerjemahkan gagasan menjadi karya dengan karakter yang berbeda.', sumberIds: ['bcm-motif'] },
      { teks: 'Daun juga dapat berperan sebagai bahan pewarna. Penelitian Dayu Dyaninoor di Pesona Tembakau pada 2012 mendokumentasikan pemanfaatan daun tembakau basah dan kering. Warna yang diperoleh bervariasi sesuai bahan dan penguncinya, termasuk krem, kuning kecokelatan, serta cokelat kehijauan.', sumberIds: ['uny-pewarna'] },
      { teks: 'Foto detail kain di atas mengajak kita memperhatikan susunan bentuk dan warna. Nama motif, pembuat, serta teknik pewarnaan kain pada foto tersebut belum dikonfirmasi; foto itu bukan bukti bahwa kainnya memakai pewarna daun tembakau.', sumberIds: [] }
    ],
    fakta: [{ teks: 'Perintang malam merupakan bagian teknik batik; penelitian 2012 mendokumentasikan ekstrak daun tembakau sebagai salah satu pewarna.', status: 'didukung-sumber', sumberIds: ['unesco-batik', 'uny-pewarna'] }],
    renungan: 'Setelah mengenal prosesnya, bagian apa dari sehelai kain yang sekarang lebih kamu perhatikan?'
  },
  {
    ringkasan: 'Warisan budaya terus hidup ketika ada yang belajar, merawat, dan menceritakannya kembali.',
    isi: [
      { teks: 'Kita sudah mengikuti perjalanan dari tempat, tanaman, dan kerja sehari-hari menuju karya. Sekarang pertanyaannya bergeser: apa yang dapat kita lakukan agar cerita seperti ini tetap dikenal?', sumberIds: [] },
      { teks: 'UNESCO menjelaskan bahwa keterampilan membatik berkaitan erat dengan identitas budaya dan kerap diteruskan di dalam keluarga. Itu mengingatkan kita bahwa merawat budaya juga berarti memberi ruang bagi pengetahuan untuk berpindah kepada orang berikutnya.', sumberIds: ['unesco-batik'] },
      { teks: 'Menuju Generasi Emas 2045, kemampuan pemuda dapat tumbuh melalui kegiatan yang dekat: mewawancarai pengrajin dengan izin, menyusun foto bercerita, mendesain karya original, atau membantu usaha lokal menjelaskan produknya dengan jujur. Ini adalah ajakan Jejak Mbako untuk menghubungkan belajar budaya dengan keterampilan kreatif.', sumberIds: [] },
      { teks: 'Kamu tidak harus memulai dengan proyek besar. Pilih satu cerita, periksa sumbernya, dan rawat kepercayaan orang yang membagikannya. Dari langkah kecil itu, jejakmu bisa dimulai.', sumberIds: [] }
    ],
    fakta: [{ teks: 'UNESCO mengaitkan keterampilan membatik dengan identitas budaya dan pewarisan pengetahuan dalam keluarga.', status: 'didukung-sumber', sumberIds: ['unesco-batik'] }],
    renungan: 'Siapa orang pertama yang ingin kamu ajak berbincang tentang cerita lokal?'
  }
];

for (const [index, chapter] of story.bab.entries()) Object.assign(chapter, narratives[index]);
story.bab[4].catatanVisual = 'Dari ruang bersama, cerita diteruskan kepada generasi berikutnya.';
story.bab[4].foto = { id: 'bab-5', src: '/assets/images/alun-alun-referensi.png', alt: 'Foto ruang publik bertuliskan Temanggung Bersenyum, sebagai pengantar ajakan pemuda merawat cerita lokal.', kredit: 'Foto kiriman pengguna · Fotografer dan izin belum dikonfirmasi.', status: 'sementara', lebar: 681, tinggi: 451 };

const checkedSources = [
  { id: 'pemkab-lanskap', judul: 'Lanskap Temanggung di antara Sumbing dan Sindoro', penerbit: 'Media Center Kabupaten Temanggung', tahun: '2021', url: 'https://mediacenter.temanggungkab.go.id/frontend/d_berita/3663', catatan: 'Bagian uraian geografi; tidak memakai klaim superlatif atau angka ketinggian.' },
  { id: 'pemkab-kopi', judul: 'Keaslian Kopi Temanggung Harus Dijaga', penerbit: 'Media Center Kabupaten Temanggung', tahun: '2023', url: 'https://mediacenter.temanggungkab.go.id/frontend/d_berita/5877', catatan: 'Komoditas kopi dan tembakau serta pekerjaan dari budidaya sampai pemasaran.' },
  { id: 'islah', judul: 'A historical study of the journey of the mbako batik industry in Temanggung (2009–2021)', penerbit: 'Husna Amalia & Wahyu Setyaningsiih · Islah, UIN Salatiga', tahun: '2025', url: 'https://ejournal.uinsalatiga.ac.id/index.php/islah/article/view/3532', catatan: 'Abstrak: Iman Nugroho, awal usaha 2009, inspirasi motif, dan peran pekerjaan bagi masyarakat Tegaltemu.' },
  { id: 'bcm-motif', judul: 'Re-designing Batik Mbako Motif Pattern', penerbit: 'Morinta Rosandini dkk. · Bandung Creative Movement, Telkom University', tahun: '2019', url: 'https://media.neliti.com/media/publications/293207-re-designing-batik-mbako-motif-pattern-773a3492.pdf', catatan: 'Halaman 1–2: unsur motif, Ron Mbako, Rigen Mbako, serta teknik tulis dan cap. Klaim jumlah/paten tidak dipakai.' },
  { id: 'uny-pewarna', judul: 'Pewarna alam pada batik dari bahan daun tembakau', penerbit: 'Dayu Dyaninoor · Universitas Negeri Yogyakarta', tahun: '2012', url: 'https://eprints.uny.ac.id/27578/', catatan: 'Abstrak penelitian di Pesona Tembakau: bahan daun basah/kering dan variasi warna; bukan identifikasi foto kain pengguna.' },
  { id: 'unesco-batik', judul: 'Indonesian Batik', penerbit: 'UNESCO · Intangible Cultural Heritage', tahun: '2009', url: 'https://ich.unesco.org/en/RL/indonesian-batik-00170?RL=00170', catatan: 'Teks resmi tersedia melalui hasil indeks pencarian. Pembukaan langsung menampilkan pemeriksaan browser; uraian teknik dan pewarisan bersandar pada cuplikan terindeks tersebut.' }
];
for (const source of checkedSources) {
  source.status = 'diperiksa';
  source.tanggalAkses = '2026-10-09';
}
const checkedIds = new Set(checkedSources.map(function (source) { return source.id; }));
const candidateSources = story.sumber.filter(function (source) { return !checkedIds.has(source.id); });
story.sumber = [...checkedSources, ...candidateSources];
writeFileSync(path, JSON.stringify(story, null, 2) + '\n');
