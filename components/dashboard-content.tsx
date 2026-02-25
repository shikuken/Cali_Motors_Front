"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/auth/actions"
import { Car, Users, DollarSign, MessageSquare, TrendingUp, Package, CreditCard, AlertCircle } from "lucide-react"
import useSWR from "swr"
import type { User } from "@supabase/supabase-js"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

export function DashboardContent({ user }: { user: User }) {
  const { data: stats, isLoading } = useSWR("/api/dashboard/stats", fetcher)

  const dashboardData = stats?.data

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold font-sans text-foreground">CaliMotors Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{dashboardData?.totalVehicles ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.availableVehicles ?? 0} available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboardData?.totalInventoryValue ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Available stock value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboardData?.totalRevenue ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">{dashboardData?.soldVehicles ?? 0} vehicles sold</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboardData?.netProfit ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Revenue minus expenses</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboardData?.monthlyRevenue ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.monthlySalesCount ?? 0} sales this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{dashboardData?.totalCustomers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Registered customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{dashboardData?.newInquiries ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(dashboardData?.totalExpenses ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(dashboardData?.monthlyExpenses ?? 0)} this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">API Endpoints</CardTitle>
                <CardDescription>Available REST API routes for CaliMotors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    { method: "GET/POST", path: "/api/vehicles", desc: "List & create vehicles" },
                    { method: "GET/PATCH/DELETE", path: "/api/vehicles/[id]", desc: "Single vehicle operations" },
                    { method: "GET/POST", path: "/api/customers", desc: "List & create customers" },
                    { method: "GET/PATCH/DELETE", path: "/api/customers/[id]", desc: "Single customer operations" },
                    { method: "GET/POST", path: "/api/sales", desc: "List & create sales (auto-marks vehicle sold)" },
                    { method: "GET/PATCH", path: "/api/sales/[id]", desc: "Single sale operations" },
                    { method: "GET/POST", path: "/api/inquiries", desc: "List & submit inquiries (public POST)" },
                    { method: "GET/PATCH/DELETE", path: "/api/inquiries/[id]", desc: "Single inquiry operations" },
                    { method: "GET/POST", path: "/api/expenses", desc: "List & create expenses" },
                    { method: "GET", path: "/api/dashboard/stats", desc: "Dashboard aggregated statistics" },
                  ].map((route) => (
                    <div key={route.path} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                        {route.method}
                      </code>
                      <div>
                        <p className="text-sm font-medium font-mono text-foreground">{route.path}</p>
                        <p className="text-xs text-muted-foreground">{route.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
