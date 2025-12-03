import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/features/dashboard/components/dashboard/stat-card";
import {
  RevenueChart,
  UsersChart,
  CategoryChart,
  SalesChart,
} from "@/features/dashboard/components/dashboard/charts";
import { statsData, chartData, mockTransactions } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Selamat datang kembali! Berikut ringkasan bisnis Anda.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pendapatan"
            value={formatCurrency(statsData.totalRevenue)}
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            description="Bulan ini"
          />
          <StatCard
            title="Total Pengguna"
            value={formatNumber(statsData.totalUsers)}
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
            description="Pengguna aktif"
          />
          <StatCard
            title="Total Pesanan"
            value={formatNumber(statsData.totalOrders)}
            icon={ShoppingCart}
            trend={{ value: 3.1, isPositive: false }}
            description="Bulan ini"
          />
          <StatCard
            title="Conversion Rate"
            value={`${statsData.conversionRate}%`}
            icon={TrendingUp}
            trend={{ value: 1.2, isPositive: true }}
            description="Rata-rata"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <RevenueChart data={chartData.revenue} />
          <UsersChart data={chartData.users} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CategoryChart data={chartData.categories} />
          <SalesChart data={chartData.revenue} />
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{transaction.customer}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.id} • {transaction.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "success"
                          : transaction.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
