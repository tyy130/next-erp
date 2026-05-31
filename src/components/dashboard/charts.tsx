"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

// ── Employee Distribution by Department ───────────────────────────────

interface DeptData {
  name: string;
  count: number;
}

export function EmployeeByDeptChart({ data }: { data: DeptData[] }) {
  const chartData = data.filter((d) => d.count > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Employees by Department</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No department data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Employees by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Employees" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Invoice Status Distribution (Donut) ───────────────────────────────

interface InvoiceStatusData {
  status: string;
  count: number;
  total: number;
}

export function InvoiceStatusChart({ data }: { data: InvoiceStatusData[] }) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
    value: d.count,
    total: d.total,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No invoices yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} invoices`, String(name)]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Revenue vs Expenses (Line/Area) ────────────────────────────────────

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export function RevenueExpensesChart({ data }: { data: RevenueData[] }) {
  if (data.length === 0 || data.every((d) => d.revenue === 0 && d.expenses === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No financial data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any) => [
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorExpenses)"
              name="Expenses"
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Leave Status Breakdown (Pie) ───────────────────────────────────────

interface LeaveData {
  status: string;
  count: number;
}

export function LeaveStatusChart({ data }: { data: LeaveData[] }) {
  const chartData = data.filter((d) => d.count > 0).map((d) => ({
    name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
    value: d.count,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No leave requests yet
        </CardContent>
      </Card>
    );
  }

  const LEAVE_COLORS: Record<string, string> = {
    Pending: "#f59e0b",
    Approved: "#22c55e",
    Rejected: "#ef4444",
    Cancelled: "#94a3b8",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={LEAVE_COLORS[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} requests`, String(name)]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Payroll History (Bar) ──────────────────────────────────────────────

interface PayrollData {
  period: string;
  gross: number;
  net: number;
}

export function PayrollHistoryChart({ data }: { data: PayrollData[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Payroll History</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No payroll runs yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Payroll History</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any) => [
                `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="gross" fill="#6366f1" radius={[4, 4, 0, 0]} name="Gross" />
            <Bar dataKey="net" fill="#22c55e" radius={[4, 4, 0, 0]} name="Net" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Deal Pipeline (Funnel-style bar) ──────────────────────────────────

interface DealData {
  stage: string;
  count: number;
  value: number;
}

export function DealPipelineChart({ data }: { data: DealData[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Deal Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No deals yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Deal Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fontSize: 11 }}
              width={80}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                name === "count" ? `${value} deals` : `$${Number(value).toLocaleString()}`,
                name === "count" ? "Deals" : "Value",
              ]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Deals" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── Headcount Trend (Line) ─────────────────────────────────────────────

interface HeadcountData {
  month: string;
  employees: number;
}

export function HeadcountTrendChart({ data }: { data: HeadcountData[] }) {
  if (data.length === 0 || data.every((d) => d.employees === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Headcount Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          Not enough data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Headcount Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="employees"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", r: 4 }}
              activeDot={{ r: 6 }}
              name="Employees"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
