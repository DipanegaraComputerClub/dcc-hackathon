"use client";
import { API_URL } from "@/config/api";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Loader2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Printer
} from "lucide-react";


interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  category?: string;
  profile_id: string;
}

interface MonthlyReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  transactions: Transaction[];
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadMonthlyReport();
    }
  }, [selectedMonth, selectedYear, profile]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/dapur-umkm/profile`);
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      setIsLoading(true);
      
      const url = `${API_URL}/dapur-umkm/report?profile_id=${profile.id}&month=${selectedMonth + 1}&year=${selectedYear}`;
      console.log('Fetching report from:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Report response:', data);
      
      if (data.success) {
        console.log('Report data:', {
          totalIncome: data.data.totalIncome,
          totalExpense: data.data.totalExpense,
          balance: data.data.balance,
          transactionCount: data.data.transactionCount,
          transactions: data.data.transactions?.length
        });
        setReport(data.data);
      } else {
        console.error('Report failed:', data.message);
        alert('Gagal load report: ' + data.message);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Error loading report: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    window.print();
    setTimeout(() => setIsExporting(false), 1000);
  };

  const exportToCSV = () => {
    if (!report || !report.transactions.length) {
      alert('Tidak ada data transaksi untuk di-export');
      return;
    }

    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'];
    const csvContent = [
      headers.join(','),
      ...report.transactions.map(t => [
        new Date(t.transaction_date).toLocaleDateString('id-ID'),
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        `"${t.category || '-'}"`,
        t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
        Number(t.amount)
      ].join(','))
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month];
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: getMonthName(i)
  }));

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div id="print-area" className="space-y-6 p-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent dark:from-red-500 dark:to-red-400">
              Laporan Keuangan
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {profile?.business_name || 'UMKM'} - Laporan Transaksi Bulanan
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={exportToPDF}
              disabled={isExporting || !report}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Print PDF
                </>
              )}
            </Button>
            <Button
              onClick={exportToCSV}
              disabled={!report || !report.transactions.length}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="bg-white dark:bg-gray-900 print:hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Filter Periode</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={loadMonthlyReport}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Tampilkan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : !report ? (
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="py-20 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Tidak ada data untuk periode yang dipilih
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Print Header (only visible when printing) */}
            <div className="hidden print:block mb-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold">{profile?.business_name || 'UMKM'}</h1>
                <p className="text-gray-600">{profile?.address || ''}</p>
                <p className="text-gray-600">{profile?.phone || ''}</p>
              </div>
              <div className="border-t-2 border-b-2 border-gray-300 py-2 my-4">
                <h2 className="text-xl font-bold text-center">
                  LAPORAN TRANSAKSI BULANAN
                </h2>
                <p className="text-center text-gray-600">
                  Periode: {getMonthName(selectedMonth)} {selectedYear}
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4 print:mb-6">
              {/* Total Pemasukan */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 print:border print:border-gray-300">
                <CardContent className="pt-6 print:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-gray-700">Total Pemasukan</p>
                      <p className="text-2xl font-bold text-green-600 print:text-lg">
                        Rp {Number(report.totalIncome).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full print:hidden">
                      <ArrowUpRight className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Pengeluaran */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 print:border print:border-gray-300">
                <CardContent className="pt-6 print:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-gray-700">Total Pengeluaran</p>
                      <p className="text-2xl font-bold text-red-600 print:text-lg">
                        Rp {Number(report.totalExpense).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full print:hidden">
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Saldo */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 print:border print:border-gray-300">
                <CardContent className="pt-6 print:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-gray-700">Saldo</p>
                      <p className={`text-2xl font-bold print:text-lg ${report.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        Rp {Number(report.balance).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full print:hidden">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Transaksi */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 print:border print:border-gray-300">
                <CardContent className="pt-6 print:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 print:text-gray-700">Total Transaksi</p>
                      <p className="text-2xl font-bold text-purple-600 print:text-lg">
                        {report.transactionCount}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full print:hidden">
                      <ShoppingCart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Table */}
            <Card className="bg-white dark:bg-gray-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <CardTitle className="text-lg">Detail Transaksi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {report.transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Tidak ada transaksi pada periode ini
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Deskripsi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tipe
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Jumlah
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {report.transactions.map((transaction, index) => (
                          <tr key={transaction.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {transaction.description}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {transaction.category || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.type === 'in' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {transaction.type === 'in' ? '↑ Masuk' : '↓ Keluar'}
                              </span>
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                              transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'in' ? '+' : '-'} Rp {Number(transaction.amount).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold">
                        <tr className="border-t-2 border-gray-300">
                          <td colSpan={4} className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                            TOTAL SALDO:
                          </td>
                          <td className={`px-4 py-3 text-right text-sm font-bold ${
                            Number(report.balance) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Rp {Number(report.balance).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Print Footer */}
            <div className="hidden print:block mt-8">
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <p>Dicetak pada: {new Date().toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-16">Mengetahui,</p>
                    <p className="border-t border-gray-400 pt-1">
                      ({profile?.business_name || 'UMKM'})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          
          /* Show print content */
          #print-area,
          #print-area * {
            visibility: visible;
          }
          
          /* Position print area */
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          
          /* Hide non-print elements */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Show print-only elements */
          .print\\:block {
            display: block !important;
          }
          
          .hidden {
            display: block !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          /* Page settings */
          @page {
            margin: 1.5cm;
            size: A4;
          }
          
          /* Remove backgrounds */
          .bg-white,
          .dark\\:bg-gray-900,
          .bg-gray-50,
          .dark\\:bg-gray-800 {
            background: white !important;
          }
          
          /* Card styling */
          .shadow-sm,
          .border {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          /* Table styling for print */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }
          
          table th,
          table td {
            border: 1px solid #666 !important;
            padding: 8px !important;
            font-size: 11px !important;
          }
          
          table thead {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          table tfoot {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: bold;
          }
          
          /* Color adjustments for print */
          .text-green-600,
          .text-green-800 {
            color: #059669 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .text-red-600,
          .text-red-800 {
            color: #dc2626 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .text-blue-600 {
            color: #2563eb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .text-purple-600 {
            color: #9333ea !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Badge colors */
          .bg-green-100 {
            background-color: #d1fae5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-red-100 {
            background-color: #fee2e2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure text is black on print */
          .text-gray-900,
          .dark\\:text-gray-100 {
            color: #111827 !important;
          }
          
          .text-gray-500,
          .text-gray-600,
          .dark\\:text-gray-400 {
            color: #6b7280 !important;
          }
          
          /* Summary cards grid */
          .grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1rem !important;
          }
          
          /* Prevent page breaks in summary cards */
          .grid > * {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
