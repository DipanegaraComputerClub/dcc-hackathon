# 🗄️ Database Migration - Visual Studio UMKM

## ⚡ Quick Setup

### 1. Run Migration di Supabase

1. Buka **Supabase Dashboard** → Project Anda
2. Klik **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy-paste isi file `migration-visual-studio-fix.sql`
5. Klik **Run** (atau tekan F5)

### 2. Verifikasi

Setelah migration berhasil, cek di **Table Editor**:
- Table: `visual_studio_activity`
- RLS Policies harus ada 2:
  - ✅ `Allow public read on visual studio activities`
  - ✅ `Allow public insert on visual studio activities`

### 3. Test Backend

```bash
cd backend
bun run dev
```

Backend seharusnya tidak ada warning lagi:
```
✅ UMKM Branding completed in 2659ms
# (tidak ada warning database)
```

## 🔍 What This Migration Does

1. **Drop old RLS policies** - Remove policies yang terlalu ketat
2. **Update activity_type** - Tambahkan support untuk `'umkm_branding'`
3. **Allow NULL user_id** - Support anonymous users (tidak perlu login)
4. **New RLS policies** - Public read & insert allowed
5. **Grant permissions** - anon + authenticated users bisa insert

## 🚨 Troubleshooting

### Error: "new row violates row-level security policy"
**Solution**: Pastikan migration sudah dijalankan di Supabase

### Error: "permission denied for table visual_studio_activity"
**Solution**: Run GRANT commands di migration file

### Error: "constraint visual_studio_activity_activity_type_check"
**Solution**: Migration akan drop & recreate constraint otomatis

## ✅ Success Checklist

- [ ] Migration file sudah di-run di Supabase SQL Editor
- [ ] Tidak ada error di SQL Editor
- [ ] Backend tidak ada warning "Failed to save to DB"
- [ ] Table `visual_studio_activity` bisa terisi data baru

## 📝 Notes

- Migration ini **AMAN** untuk production (hanya update policies)
- Tidak menghapus data existing
- Support backward compatibility dengan endpoint lama
