-- ============================================================================
-- Seed Data: Apoffa
--
-- Provides:
--   - 12 sample case decisions from the Indonesian Supreme Court
--   - Default app settings
--   - Legal issue taxonomy
--   - Sample judges
-- ============================================================================

-- Sample case decisions
INSERT INTO case_decisions (case_number, title, case_date, case_type, court, judge_panel, decision, legal_basis, relevant_laws, case_summary, full_text, pdf_url, source_url, metadata) VALUES
('123/K/Pdt.SUS-PHI/2022', 'Putusan Gugatan Perdata - Sengketa Hubungan Industrial', '2022-06-15', 'Perdata', 'Pengadilan Hubungan Industrial Jakarta', 'Dr. H. Ahmad Santoso, S.H., M.H.', 'Mengadili: Menerima gugatan pemohon sebagian;', 'UU No. 13 Tahun 2003 tentang Ketenagakerjaan; PP No. 35 Tahun 2021;', 'UU Ketenagakerjaan, PHK, Pesangon', 'Gugatan terkait pemutusan hubungan kerja yang diduga tidak sesuai prosedur.', 'Dalam perkara ini, Pemohon mengajukan gugatan terhadap Termohon terkait pemutusan hubungan kerja. Mahkamah mempertimbangkan bahwa pemutusan dilakukan tanpa prosedur yang sesuai dengan UU Ketenagakerjaan. Mengadili menerima gugatan sebagian dan menyatakan Termohon wajib membayar pesangon sebesar 18 bulan gaji.', 'https://putusan3.mahkamahagung.go.id/f/123.pdf', 'https://putusan3.mahkamahagung.go.id/f/123', '{"category": "Sengketa PHK", "year": 2022}'),
('456/K/Pdt.SUS-PHI/2021', 'Putusan Banding - Upah Minimum Sektoral', '2021-09-20', 'Perdata', 'Pengadilan Hubungan Industrial Bandung', 'Hj. Sri Wahyuni, S.H., M.H.', 'Mengadili: Menerima banding pembanding;', 'UU No. 13 Tahun 2003; UU No. 11 Tahun 2020;', 'UU Cipta Kerja, UMP, UMS', 'Sengketa penetapan Upah Minimum Sektoral di Kabupaten Bandung.', 'Dalam perkara banding ini, Pembanding mengajukan keberatan terhadap penetapan UMS. Mahkamah mempertimbangkan bahwa penetapan telah sesuai dengan formula yang berlaku. Mengadili menolak banding dan menguatkan putusan tingkat pertama.', 'https://putusan3.mahkamahagung.go.id/f/456.pdf', 'https://putusan3.mahkamahagung.go.id/f/456', '{"category": "Upah Minimum", "year": 2021}'),
('789/K/Pdt.SUS-PHI/2020', 'Putusan Kasasi - Perlindungan Buruh Migran', '2020-03-10', 'Perdata', 'Mahkamah Agung', 'Prof. Dr. H. M. Laica Marzuki, S.H.', 'Mengadili: Menolak kasasi pemohon kasasi;', 'UU No. 18 Tahun 2017; UU No. 39 Tahun 2004;', 'UU PMI, Perlindungan Buruh Migran', 'Kasasi terkait perlindungan hak buruh migran yang mengalami kecelakaan kerja di luar negeri.', 'Mahkamah Agung mempertimbangkan bahwa pengajuan kasasi tidak memenuhi syarat formil. Terlepas dari demikian, secara materiil Mahkamah berpendapat bahwa PT yang bersangkutan telah cukup memberikan perlindungan. Mengadili menolak kasasi.', 'https://putusan3.mahkamahagung.go.id/f/789.pdf', 'https://putusan3.mahkamahagung.go.id/f/789', '{"category": "Buruh Migran", "year": 2020}'),
('321/K/Pdt.SUS-PHI/2023', 'Putusan Gugatan - Diskriminasi di Tempat Kerja', '2023-01-25', 'Perdata', 'Pengadilan Hubungan Industrial Surabaya', 'Dr. H. Rina Indriani, S.H., M.Hum.', 'Mengadili: Menerima gugatan pemohon;', 'UU No. 13 Tahun 2003; UU No. 21 Tahun 1999;', 'Diskriminasi, Kesetaraan Gender, UU Ketenagakerjaan', 'Gugatan diskriminasi berdasarkan jenis kelamin dalam proses promosi jabatan.', 'Mahkamah mempertimbangkan bahwa Termohon telah melakukan diskriminasi terhadap Pemohon dalam proses promosi. Bukti menunjukkan adanya perlakuan berbeda tanpa dasar yang obyektif. Mengadili menerima gugatan dan menyatakan Termohon wajib memberikan promosi.', 'https://putusan3.mahkamahagung.go.id/f/321.pdf', 'https://putusan3.mahkamahagung.go.id/f/321', '{"category": "Diskriminasi", "year": 2023}'),
('654/K/Pdt.SUS-PHI/2022', 'Putusan Review - Jaminan Sosial Tenaga Kerja', '2022-11-05', 'Perdata', 'Mahkamah Agung', 'Dr. H. Sunarto, S.H., M.Hum.', 'Mengadili: Menerima permohonan peninjauan kembali sebagian;', 'UU No. 24 Tahun 2011; UU No. 13 Tahun 2003;', 'BPJS Ketenagakerjaan, Jaminan Sosial', 'Peninjauan kembali putusan terkait kewajiban BPJS Ketenagakerjaan.', 'Mahkamah Agung mempertimbangkan bahwa terdapat kekeliruan dalam penerapan hukum oleh Pengadilan Tingkat Banding. Mengenai kewajiban iuran BPJS, Mahkamah berpendapat bahwa pengusaha wajib membayar iuran penuh. Mengadili menerima peninjauan kembali sebagian.', 'https://putusan3.mahkamahagung.go.id/f/654.pdf', 'https://putusan3.mahkamahagung.go.id/f/654', '{"category": "BPJS", "year": 2022}'),
('987/K/Pdt.SUS-PHI/2021', 'Putusan Gugatan - Penundaan Pembayaran Upah', '2021-07-18', 'Perdata', 'Pengadilan Hubungan Industrial Medan', 'H. Budi Hartono, S.H.', 'Mengadili: Menerima gugatan pemohon sebagian;', 'UU No. 13 Tahun 2003; PP No. 78 Tahun 2015;', 'Kepmenaker, Upah, Pembayaran Upah', 'Gugatan terkait penundaan pembayaran upah selama 3 bulan berturut-turut.', 'Mahkamah mempertimbangkan bahwa keterlambatan pembayaran upah telah terbukti. Pemohon berhak menerima upah yang tertunda ditambah denda keterlambatan sesuai ketentuan. Mengadili menerima gugatan sebagian dan menyatakan Termohon wajib membayar.', 'https://putusan3.mahkamahagung.go.id/f/987.pdf', 'https://putusan3.mahkamahagung.go.id/f/987', '{"category": "Upah", "year": 2021}'),
('147/K/Pdt.SUS-PHI/2020', 'Putusan Banding - Pemogokan Legal', '2020-12-01', 'Perdata', 'Pengadilan Hubungan Industrial Semarang', 'Dr. H. Widayati, S.H., M.H.', 'Mengadili: Menolak banding pembanding;', 'UU No. 13 Tahun 2003; UU No. 21 Tahun 1954;', 'UU Pemogokan, Mogok Kerja, UU Ketenagakerjaan', 'Sengketa terkait legalitas aksi pemogokan yang dilakukan oleh serikat pekerja.', 'Mahkamah mempertimbangkan bahwa pemogokan yang dilakukan telah memenuhi syarat legalitas sesuai UU No. 21 Tahun 1954. Penyampaian pemberitahuan telah dilakukan sesuai prosedur. Mengadili menolak banding dan menguatkan putusan pertama.', 'https://putusan3.mahkamahagung.go.id/f/147.pdf', 'https://putusan3.mahkamahagung.go.id/f/147', '{"category": "Pemogokan", "year": 2020}'),
('258/K/Pdt.SUS-PHI/2023', 'Putusan Kasasi - outsourcing dan Alih Daya', '2023-04-12', 'Perdata', 'Mahkamah Agung', 'Prof. Dr. H. Abdul Kadir, S.H., M.Hum.', 'Mengadili: Menerima kasasi pemohon kasasi sebagian;', 'UU No. 13 Tahun 2003; UU No. 11 Tahun 2020;', 'UU Cipta Kerja, Outsourcing, Alih Daya', 'Kasasi terkait status tenaga alih daya dan kewajiban perusahaan outsourcing.', 'Mahkamah Agung mempertimbangkan bahwa perusahaan outsourcing wajib menjamin perlindungan terhadap pekerja alih daya. Pemohon kasasi telah dibebastugaskan tanpa alasan yang sah. Mengadili menerima kasasi sebagian.', 'https://putusan3.mahkamahagung.go.id/f/258.pdf', 'https://putusan3.mahkamahagung.go.id/f/258', '{"category": "Outsourcing", "year": 2023}'),
('369/K/Pdt.SUS-PHI/2022', 'Putusan Gugatan - Hak Cuti Tahunan', '2022-08-30', 'Perdata', 'Pengadilan Hubungan Industrial Yogyakarta', 'Hj. Dewi Lestari, S.H., M.H.', 'Mengadili: Menerima gugatan pemohon;', 'UU No. 13 Tahun 2003; PP No. 11 Tahun 2022;', 'Cuti Tahunan, Hak Cuti, UU Ketenagakerjaan', 'Gugatan terkait penolakan penggunaan hak cuti tahunuan oleh pengusaha.', 'Mahkamah mempertimbangkan bahwa Pemohon berhak atas cuti tahunuan sesuai masa kerjanya. Penolakan Termohon tidak memiliki dasar yang sah. Mengadili menerima gugatan dan menyatakan Termohon wajib memberikan cuti.', 'https://putusan3.mahkamahagung.go.id/f/369.pdf', 'https://putusan3.mahkamahagung.go.id/f/369', '{"category": "Cuti", "year": 2022}'),
('741/K/Pdt.SUS-PHI/2021', 'Putusan Review - Pekerja Rumahan', '2021-05-22', 'Perdata', 'Mahkamah Agung', 'Dr. H. Suryanto, S.H., M.Hum.', 'Mengadili: Menolak permohonan peninjauan kembali;', 'UU No. 13 Tahun 2003; Kepmenaker No. 5 Tahun 2018;', 'Pekerja Rumahan, Homeworker, UU Ketenagakerjaan', 'Peninjauan kembali putusan terkait status perlindungan pekerja rumahan.', 'Mahkamah Agung mempertimbangkan bahwa pekerja rumahan telah mendapatkan perlindungan sesuai Kepmenaker No. 5 Tahun 2018. Tidak terdapat kekeliruan dalam penerapan hukum. Mengadili menolak peninjauan kembali.', 'https://putusan3.mahkamahagung.go.id/f/741.pdf', 'https://putusan3.mahkamahagung.go.id/f/741', '{"category": "Pekerja Rumahan", "year": 2021}'),
('852/K/Pdt.SUS-PHI/2020', 'Putusan Banding - Serikat Pekerja', '2020-10-14', 'Perdata', 'Pengadilan Hubungan Industrial Makassar', 'H. Ahmad Fauzi, S.H., M.H.', 'Mengadili: Menerima banding pembanding sebagian;', 'UU No. 13 Tahun 2003; UU No. 21 Tahun 2000;', 'Serikat Pekerja, SP/SB, UU Ketenagakerjaan', 'Sengketa terkait pengesahan serikat pekerja dan pemecatan anggota.', 'Mahkamah mempertimbangkan bahwa tindakan pengusaha dalam memecat anggota serikat pekerja merupakan tindakan diskriminatif. Pengesahan serikat pekerja telah sesuai prosedur. Mengadili menerima banding sebagian.', 'https://putusan3.mahkamahagung.go.id/f/852.pdf', 'https://putusan3.mahkamahagung.go.id/f/852', '{"category": "Serikat Pekerja", "year": 2020}'),
('963/K/Pdt.SUS-PHI/2023', 'Putusan Gugatan - Kecelakaan Kerja', '2023-02-28', 'Perdata', 'Pengadilan Hubungan Industrial Jakarta', 'Dr. Hj. Ratna Sari, S.H., M.H.', 'Mengadili: Menerima gugatan pemohon sebagian;', 'UU No. 13 Tahun 2003; UU No. 24 Tahun 2011;', 'BPJS Ketenagakerjaan, Kecelakaan Kerja, JKK', 'Gugatan terkait tunjangan kecelakaan kerja yang tidak dibayar penuh.', 'Mahkamah mempertimbangkan bahwa kecelakaan kerja yang dialami Pemohon terjadi dalam masa kerja. Termohon wajib memberikan jaminan kecelakaan kerja melalui BPJS Ketenagakerjaan. Mengadili menerima gugatan sebagian.', 'https://putusan3.mahkamahagung.go.id/f/963.pdf', 'https://putusan3.mahkamahagung.go.id/f/963', '{"category": "Kecelakaan Kerja", "year": 2023}');

-- Default app settings
INSERT INTO app_settings (key, value, description) VALUES
('max_search_results', '{"value": 50}', 'Maximum search results per query'),
('default_embedding_model', '{"value": "bge-m3"}', 'Default embedding model for RAG'),
('rag_enabled', '{"value": true}', 'Whether RAG is enabled'),
('ingestion_rate_limit', '{"value": 100}', 'Max pages to ingest per hour'),
('site_name', '{"value": "Apoffa"}', 'Application display name'),
('theme', '{"value": "light"}', 'Default UI theme'),
('items_per_page', '{"value": 20}', 'Default pagination size'),
('search_delay_ms', '{"value": 300}', 'Debounce delay for search input'),
('version', '{"value": "2.0.0"}', 'Application version');

-- Legal issue taxonomy
INSERT INTO issues (name, category, description) VALUES
('Sengketa PHK', 'Pemutusan Hubungan Kerja', 'Perselisihan terkait pemutusan hubungan kerja'),
('Upah Minimum', 'Upah', 'Perselisihan terkait penetapan upah minimum'),
('Buruh Migran', 'Perlindungan', 'Perselisihan terkait perlindungan buruh migran'),
('Diskriminasi', 'Hak Dasar', 'Perselisihan terkait diskriminasi di tempat kerja'),
('BPJS Ketenagakerjaan', 'Jaminan Sosial', 'Perselisihan terkait BPJS Ketenagakerjaan'),
('Upah dan Pembayaran', 'Upah', 'Perselisihan terkait pembayaran upah'),
('Pemogokan', 'Aksi', 'Perselisihan terkait legalitas pemogokan'),
('Outsourcing', 'Hubungan Kerja', 'Perselisihan terkait outsourcing dan alih daya'),
('Cuti', 'Hak Dasar', 'Perselisihan terkait hak cuti'),
('Pekerja Rumahan', 'Perlindungan', 'Perselisihan terkait pekerja rumahan'),
('Serikat Pekerja', 'Organisasi', 'Perselisihan terkait serikat pekerja'),
('Kecelakaan Kerja', 'K3', 'Perselisihan terkait kecelakaan kerja'),
('Pesangon', 'Pemutusan Hubungan Kerja', 'Perselisihan terkait pembayaran pesangon'),
('Kontrak Kerja', 'Hubungan Kerja', 'Perselisihan terkait perjanjian kerja'),
('Waktu Kerja', 'Hak Dasar', 'Perselisihan terkait jam kerja dan lembur');

-- Sample judges
INSERT INTO judges (name, title, court, case_count) VALUES
('Dr. H. Ahmad Santoso, S.H., M.H.', 'Ketua', 'Pengadilan Hubungan Industrial Jakarta', 150),
('Hj. Sri Wahyuni, S.H., M.H.', 'Hakim', 'Pengadilan Hubungan Industrial Bandung', 89),
('Prof. Dr. H. M. Laica Marzuki, S.H.', 'Hakim Agung', 'Mahkamah Agung', 245),
('Dr. H. Rina Indriani, S.H., M.Hum.', 'Ketua', 'Pengadilan Hubungan Industrial Surabaya', 120),
('Dr. H. Sunarto, S.H., M.Hum.', 'Hakim Agung', 'Mahkamah Agung', 198),
('H. Budi Hartono, S.H.', 'Hakim', 'Pengadilan Hubungan Industrial Medan', 76),
('Dr. H. Widayati, S.H., M.H.', 'Ketua', 'Pengadilan Hubungan Industrial Semarang', 134),
('Prof. Dr. H. Abdul Kadir, S.H., M.Hum.', 'Hakim Agung', 'Mahkamah Agung', 312),
('Hj. Dewi Lestari, S.H., M.H.', 'Hakim', 'Pengadilan Hubungan Industrial Yogyakarta', 67),
('Dr. H. Suryanto, S.H., M.Hum.', 'Hakim Agung', 'Mahkamah Agung', 178),
('H. Ahmad Fauzi, S.H., M.H.', 'Ketua', 'Pengadilan Hubungan Industrial Makassar', 95),
('Dr. Hj. Ratna Sari, S.H., M.H.', 'Hakim', 'Pengadilan Hubungan Industrial Jakarta', 143);
