# Monthly Report API Documentation

## Overview
API endpoint untuk menghasilkan laporan transaksi bulanan dengan kemampuan export ke PDF dan CSV.

## Endpoint

### GET `/api/dapur-umkm/report`

Mengambil laporan transaksi untuk bulan dan tahun tertentu.

**Query Parameters:**
- `profile_id` (required): UUID dari UMKM profile
- `month` (required): Bulan (1-12)
- `year` (required): Tahun (contoh: 2025)

**Request Example:**
```
GET /api/dapur-umkm/report?profile_id=xxx-xxx&month=12&year=2025
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "month": "Desember",
    "year": 2025,
    "totalIncome": 5000000,
    "totalExpense": 2000000,
    "balance": 3000000,
    "transactionCount": 45,
    "transactions": [
      {
        "id": "uuid",
        "transaction_date": "2025-12-15T10:30:00Z",
        "description": "Penjualan Coto Makassar",
        "amount": 150000,
        "type": "in",
        "category": "Penjualan",
        "profile_id": "uuid"
      },
      {
        "id": "uuid",
        "transaction_date": "2025-12-14T08:00:00Z",
        "description": "Beli Bahan Baku",
        "amount": 500000,
        "type": "out",
        "category": "Pembelian",
        "profile_id": "uuid"
      }
    ]
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "profile_id diperlukan"
}
```

**Response Error (400) - Invalid Month:**
```json
{
  "success": false,
  "message": "month harus antara 1-12"
}
```

## Frontend Integration

### Analytics Page Features

1. **Filter by Period**
   - Dropdown untuk pilih bulan (Januari - Desember)
   - Dropdown untuk pilih tahun (5 tahun terakhir)
   - Button "Tampilkan" untuk load data

2. **Summary Cards**
   - Total Pemasukan (hijau)
   - Total Pengeluaran (merah)
   - Saldo (biru/merah tergantung positif/negatif)
   - Total Transaksi (purple)

3. **Transaction Table**
   - Tanggal transaksi
   - Deskripsi
   - Kategori
   - Tipe (Masuk/Keluar dengan badge)
   - Jumlah (dengan format Rupiah)
   - Total saldo di footer

4. **Export Features**
   - **Print PDF**: Menggunakan `window.print()` dengan CSS print-specific
   - **Export CSV**: Download file CSV dengan format spreadsheet

### Export Implementation

#### Print to PDF
```typescript
const exportToPDF = () => {
  setIsExporting(true);
  window.print();
  setTimeout(() => setIsExporting(false), 1000);
};
```

CSS untuk print:
```css
@media print {
  /* Hide elements with print:hidden class */
  .print\:hidden {
    display: none !important;
  }
  
  /* Show elements with print:block class */
  .print\:block {
    display: block !important;
  }
  
  /* Page margins */
  @page {
    margin: 1.5cm;
  }
}
```

#### Export to CSV
```typescript
const exportToCSV = () => {
  if (!report || !report.transactions.length) return;

  const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'];
  const csvContent = [
    headers.join(','),
    ...report.transactions.map(t => [
      new Date(t.transaction_date).toLocaleDateString('id-ID'),
      `"${t.description}"`,
      t.category || '-',
      t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
      t.amount
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_${monthName}_${year}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

## Print Layout

### Header (Print Only)
```
┌─────────────────────────────────────────┐
│          [Business Name]                │
│          [Address]                      │
│          [Phone]                        │
├─────────────────────────────────────────┤
│   LAPORAN TRANSAKSI BULANAN             │
│   Periode: Desember 2025                │
└─────────────────────────────────────────┘
```

### Summary Section
```
┌──────────────────────┬──────────────────────┐
│ Total Pemasukan      │ Total Pengeluaran    │
│ Rp 5,000,000         │ Rp 2,000,000         │
├──────────────────────┼──────────────────────┤
│ Saldo                │ Total Transaksi      │
│ Rp 3,000,000         │ 45                   │
└──────────────────────┴──────────────────────┘
```

### Transaction Table
```
┌─────────┬────────────┬──────────┬──────┬────────────┐
│ Tanggal │ Deskripsi  │ Kategori │ Tipe │ Jumlah     │
├─────────┼────────────┼──────────┼──────┼────────────┤
│ 15 Des  │ Penjualan  │ Jual     │ ↑    │ +150,000   │
│ 14 Des  │ Beli Bahan │ Beli     │ ↓    │ -500,000   │
├─────────┴────────────┴──────────┴──────┼────────────┤
│                      TOTAL SALDO:       │ 3,000,000  │
└─────────────────────────────────────────┴────────────┘
```

### Footer (Print Only)
```
┌─────────────────────────────────────────┐
│ Dicetak pada: 6 Desember 2025, 10:30   │
│                                         │
│                          Mengetahui,    │
│                                         │
│                          ____________   │
│                          (UMKM Name)    │
└─────────────────────────────────────────┘
```

## CSV Format

File CSV yang dihasilkan:
```csv
Tanggal,Deskripsi,Kategori,Tipe,Jumlah
15/12/2025,"Penjualan Coto Makassar",Penjualan,Pemasukan,150000
14/12/2025,"Beli Bahan Baku",Pembelian,Pengeluaran,500000
13/12/2025,"Penjualan Menu Paket",Penjualan,Pemasukan,200000
```

**Filename Format:**
```
Laporan_[Bulan]_[Tahun].csv
Contoh: Laporan_Desember_2025.csv
```

## Backend Logic

### Date Range Calculation
```typescript
// Calculate first day of month
const startDate = new Date(year, month - 1, 1)

// Calculate last day of month (23:59:59)
const endDate = new Date(year, month, 0, 23, 59, 59)

// Query with date range
.gte('transaction_date', startDate.toISOString())
.lte('transaction_date', endDate.toISOString())
```

### Summary Calculation
```typescript
const totalIncome = transactions
  ?.filter(t => t.type === 'in')
  .reduce((sum, t) => sum + Number(t.amount), 0) || 0

const totalExpense = transactions
  ?.filter(t => t.type === 'out')
  .reduce((sum, t) => sum + Number(t.amount), 0) || 0

const balance = totalIncome - totalExpense
```

## Usage Examples

### Load Report for December 2025
```typescript
const loadMonthlyReport = async () => {
  const res = await fetch(
    `${API_URL}/api/dapur-umkm/report?profile_id=${profileId}&month=12&year=2025`
  );
  const data = await res.json();
  
  if (data.success) {
    setReport(data.data);
  }
};
```

### Filter Change Handler
```typescript
const handleMonthChange = (e) => {
  setSelectedMonth(Number(e.target.value));
  // Will trigger useEffect to reload data
};

const handleYearChange = (e) => {
  setSelectedYear(Number(e.target.value));
  // Will trigger useEffect to reload data
};
```

## UI Components

### Month Selector
```typescript
<select value={selectedMonth} onChange={handleMonthChange}>
  {months.map(month => (
    <option key={month.value} value={month.value}>
      {month.label}
    </option>
  ))}
</select>
```

### Year Selector
```typescript
const years = Array.from({ length: 5 }, (_, i) => 
  new Date().getFullYear() - i
);

<select value={selectedYear} onChange={handleYearChange}>
  {years.map(year => (
    <option key={year} value={year}>{year}</option>
  ))}
</select>
```

## Error Handling

### No Data State
```typescript
{!report ? (
  <div className="text-center py-20">
    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <p>Tidak ada data untuk periode yang dipilih</p>
  </div>
) : (
  // Show report
)}
```

### Empty Transactions
```typescript
{report.transactions.length === 0 ? (
  <p className="text-center py-8">
    Tidak ada transaksi pada periode ini
  </p>
) : (
  // Show table
)}
```

## Performance Considerations

1. **Lazy Loading**: Report hanya di-load ketika user pilih periode
2. **Query Optimization**: Backend menggunakan index pada `transaction_date`
3. **Frontend Caching**: Report di-cache di state sampai period berubah
4. **Pagination**: Tidak perlu pagination karena data dibatasi per bulan

## Security

- Endpoint memerlukan `profile_id` yang valid
- Frontend harus sudah login untuk akses dashboard
- Data hanya ditampilkan untuk UMKM yang sesuai dengan user session

## Future Enhancements

- [ ] Export to Excel (.xlsx) dengan formatting
- [ ] Email report otomatis setiap akhir bulan
- [ ] Comparison dengan bulan sebelumnya
- [ ] Chart/grafik trend bulanan
- [ ] Filter tambahan: kategori, tipe transaksi
- [ ] Laporan tahunan (annual report)
- [ ] WhatsApp share untuk kirim laporan
- [ ] Custom date range (tidak hanya per bulan)

## Testing Checklist

- [ ] Filter bulan berfungsi dengan benar
- [ ] Filter tahun berfungsi dengan benar
- [ ] Summary cards menampilkan angka yang akurat
- [ ] Tabel transaksi sorted by date descending
- [ ] Print PDF menghasilkan layout yang rapi
- [ ] CSV export berisi data yang lengkap
- [ ] Empty state ditampilkan jika tidak ada data
- [ ] Loading state berfungsi
- [ ] Error handling untuk API failure
- [ ] Responsive design di mobile

## Troubleshooting

**Issue**: Data tidak muncul
- Check apakah `profile_id` valid
- Pastikan ada transaksi di bulan yang dipilih
- Check console untuk error

**Issue**: Print PDF tidak rapi
- Gunakan browser Chrome/Edge untuk hasil terbaik
- Pastikan CSS print styles ter-load

**Issue**: CSV file tidak ter-download
- Check browser allow pop-ups
- Pastikan data transactions tidak kosong

**Issue**: Tanggal tidak sesuai
- Timezone server dan client harus match
- Backend menggunakan ISO date format
