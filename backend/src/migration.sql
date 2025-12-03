-- Table untuk menyimpan history copywriting
CREATE TABLE IF NOT EXISTS copywriting_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_produk VARCHAR(255) NOT NULL,
  jenis_konten VARCHAR(100) NOT NULL,
  gaya_bahasa VARCHAR(100) NOT NULL,
  tujuan_konten TEXT NOT NULL,
  main_text TEXT NOT NULL,
  alternatives JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_copywriting_history_created_at ON copywriting_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_copywriting_history_nama_produk ON copywriting_history(nama_produk);

-- Trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_copywriting_history_updated_at 
BEFORE UPDATE ON copywriting_history 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Komentar untuk dokumentasi
COMMENT ON TABLE copywriting_history IS 'Menyimpan history generate copywriting dengan AI';
COMMENT ON COLUMN copywriting_history.nama_produk IS 'Nama produk yang di-generate copywriting-nya';
COMMENT ON COLUMN copywriting_history.jenis_konten IS 'Jenis konten: Caption, Story, Post, Tweet, dll';
COMMENT ON COLUMN copywriting_history.gaya_bahasa IS 'Gaya bahasa: Formal, Makassar Halus, Daeng Friendly, Gen Z TikTok';
COMMENT ON COLUMN copywriting_history.tujuan_konten IS 'Tujuan konten: brand awareness, jualan, engagement, edukasi';
COMMENT ON COLUMN copywriting_history.main_text IS 'Hasil copywriting utama dari AI';
COMMENT ON COLUMN copywriting_history.alternatives IS 'Array alternatif copywriting (3-5 pilihan)';
