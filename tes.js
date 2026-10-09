(async () => {

  const headers= {
    "accept": "application/json",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/json",
    "priority": "u=1, i",
    "x-csrf-token": "8eBNj2tCscBlMmV6sRm9J16s2OvHoEe2Gwy5veTm",
    "cookie": "XSRF-TOKEN=eyJpdiI6IkZQd1JOQ1dYVVJkSFVwdlJRc0NIUGc9PSIsInZhbHVlIjoidXBLVUlNZ0ZGbFZEaVdnajlPWnRHQWRLYzAvOVNSRTErZU0yWS83dS9zalFndmZ5SVZOdVFNSnVIQnZBODh2U1FsSTRXWkVRODZvd3JkbWJkTDBmejdUQUdjbFowa2RFVUVBSE5uYUtnSklVZ1VidUw4SVozVCtRRnIwRGZ5MVAiLCJtYWMiOiJjN2M1MTU3YTIzMzJlNjM1NTVkNjI4NTAxODllMzUwZDZlYTc1YWE2MjlmZDExMWVjNWZlZGFmM2JhZjMwNGUzIiwidGFnIjoiIn0%3D; bahasakuinggris_session=eyJpdiI6ImVJUlVDY2pvTENnSlBxQzBHRnhVOHc9PSIsInZhbHVlIjoiNFNxa1BWRUtHRitmdUdnQTRwZVRLV0VoUlYrSUs1RkRlR3M2MFE1U1Zmc3QyRlJHUVh5TnpEWWNnMmx5bmVpMlJpOFZxSHVtclNuNklIeG94WTA4YmpJZEViQmIzUXZNSDIreW4zT1BhSEdJQjkrUCtmSWxBQXlCV3lESXZ0Y2UiLCJtYWMiOiI1Nzg0OWIyOTI4ZTMyOTk1N2Y5NzE1Njc3NmVjNzkyYTI1MzQwYzQ5OTZiZmQ4YzlhODc3ODRhOWY2NWNlZDEyIiwidGFnIjoiIn0%3D",
    "Referer": "https://tautantes.com/user/exams/8zvi1"
  };
  function delay() {
  const ms = 2000 + Math.floor(Math.random() * 1001);
  return new Promise(resolve => setTimeout(resolve, ms));
}

  // PENGATURAN
  const dari = 107;
  const sampai = 140;
  //const delayMs = delay();

  const idTetap = 424570;
  const idNomor1 = 424571;
  const doExamId = 3032;

  if (
    !Number.isInteger(dari) ||
    !Number.isInteger(sampai) ||
    dari < 1 || sampai > 140 || dari > sampai
  ) {
    throw new Error("Rentang nomor harus antara 1–140.");
  }


  const hasil = [];

  try {
    for (let nomor = dari; nomor <= sampai; nomor++) {
      if (nomor > dari) {
        await delay()
      }

      const targetId = idNomor1 + nomor - 1;

      const response = await fetch(
        "https://tautantes.com/user/post_answer",
        {
          method: "POST",
          credentials: "same-origin",
          signal: AbortSignal.timeout(30000),
          headers,
          body: JSON.stringify({
            id: idTetap,
            answer: "d",
            status: null,
            next_id: targetId,
            do_exam_id: doExamId
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Nomor ${nomor}: HTTP ${response.status}`);
      }

      const data = await response.json();

      const soal = [
        data.soal_now,
        data.next_soal,
        data.previous_soal
      ].find(item =>
        Number(item?.id) === targetId &&
        Number(item?.do_exam_id) === doExamId
      );

      const pertanyaan = soal?.soal_quest;
      const kunci = String(pertanyaan?.option_key ?? "")
        .trim()
        .toLowerCase();

      if (!["a", "b", "c", "d"].includes(kunci)) {
        throw new Error(`Kunci nomor ${nomor} tidak ditemukan.`);
      }

      const teks = pertanyaan[`option_${kunci}`];

      if (teks == null) {
        throw new Error(`Teks jawaban nomor ${nomor} tidak ditemukan.`);
      }

      const jawaban = `${nomor}. ${kunci.toUpperCase()}. ${teks}`;

      hasil.push(jawaban);
    
      console.log(jawaban);
    }
  } catch (error) {
    console.error(error.message);
  }
})();

