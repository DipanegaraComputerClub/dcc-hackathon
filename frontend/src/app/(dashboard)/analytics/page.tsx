import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  RevenueChart,
  UsersChart,
  CategoryChart,
  SalesChart,
} from "@/components/dashboard/charts";
import { chartData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analisis mendalam tentang performa bisnis Anda
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6">
          <RevenueChart data={chartData.revenue} />

          <div className="grid gap-6 md:grid-cols-2">
            <UsersChart data={chartData.users} />
            <SalesChart data={chartData.revenue} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CategoryChart data={chartData.categories} />

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      📈 Revenue Growth
                    </h4>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      Pendapatan meningkat 12.5% dibanding bulan lalu
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      👥 User Acquisition
                    </h4>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      320 pengguna baru bergabung bulan ini
                    </p>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                      🎯 Top Category
                    </h4>
                    <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                      Electronics adalah kategori terpopuler (35%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
