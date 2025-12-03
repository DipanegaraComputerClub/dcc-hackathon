export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "manager";
  status: "active" | "inactive";
  avatar?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Andi Mashdar",
    email: "andi@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Budi Santoso",
    email: "budi@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Citra Dewi",
    email: "citra@example.com",
    role: "manager",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Dedi Kurniawan",
    email: "dedi@example.com",
    role: "user",
    status: "inactive",
    createdAt: "2024-04-05",
  },
  {
    id: "5",
    name: "Eka Putri",
    email: "eka@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-05-12",
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: "TRX001",
    customer: "Andi Mashdar",
    amount: 2500000,
    status: "completed",
    date: "2024-12-01",
  },
  {
    id: "TRX002",
    customer: "Budi Santoso",
    amount: 1750000,
    status: "pending",
    date: "2024-12-02",
  },
  {
    id: "TRX003",
    customer: "Citra Dewi",
    amount: 3200000,
    status: "completed",
    date: "2024-12-02",
  },
  {
    id: "TRX004",
    customer: "Dedi Kurniawan",
    amount: 950000,
    status: "failed",
    date: "2024-12-03",
  },
  {
    id: "TRX005",
    customer: "Eka Putri",
    amount: 4100000,
    status: "completed",
    date: "2024-12-03",
  },
];

export const chartData = {
  revenue: [
    { month: "Jan", value: 12500000 },
    { month: "Feb", value: 15200000 },
    { month: "Mar", value: 18900000 },
    { month: "Apr", value: 16700000 },
    { month: "May", value: 21300000 },
    { month: "Jun", value: 24800000 },
  ],
  users: [
    { month: "Jan", value: 1200 },
    { month: "Feb", value: 1850 },
    { month: "Mar", value: 2100 },
    { month: "Apr", value: 2450 },
    { month: "May", value: 2890 },
    { month: "Jun", value: 3200 },
  ],
  categories: [
    { name: "Electronics", value: 35 },
    { name: "Fashion", value: 25 },
    { name: "Food", value: 20 },
    { name: "Books", value: 12 },
    { name: "Others", value: 8 },
  ],
};

export const statsData = {
  totalRevenue: 24800000,
  totalUsers: 3200,
  totalOrders: 1847,
  conversionRate: 3.24,
};
