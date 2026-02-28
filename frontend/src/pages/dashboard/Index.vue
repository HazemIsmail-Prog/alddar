<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import useAuthStore from '@/stores/auth'
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const authStore = useAuthStore()
const user = authStore.user

// Dummy KPI stats
const stats = [
  {
    title: 'Total Revenue',
    value: '$45,231',
    change: '+20.1%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'chart-1',
  },
  {
    title: 'Active Users',
    value: '2,350',
    change: '+15.3%',
    trend: 'up' as const,
    icon: Users,
    color: 'chart-2',
  },
  {
    title: 'Orders',
    value: '1,234',
    change: '-2.4%',
    trend: 'down' as const,
    icon: ShoppingCart,
    color: 'chart-3',
  },
  {
    title: 'Conversion',
    value: '3.2%',
    change: '+0.8%',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'chart-4',
  },
]

// Dummy revenue chart data (last 6 months)
const chartData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 78 },
  { month: 'Mar', value: 52 },
  { month: 'Apr', value: 91 },
  { month: 'May', value: 84 },
  { month: 'Jun', value: 96 },
]

const maxChartValue = Math.max(...chartData.map((d) => d.value))

// Dummy recent activity
const activities = [
  { id: 1, user: 'John Doe', action: 'placed order', target: '#ORD-4521', time: '2 min ago' },
  { id: 2, user: 'Jane Smith', action: 'signed up', target: '', time: '15 min ago' },
  { id: 3, user: 'Mike Johnson', action: 'completed payment', target: '#PAY-8823', time: '1 hour ago' },
  { id: 4, user: 'Sarah Williams', action: 'updated profile', target: '', time: '2 hours ago' },
  { id: 5, user: 'Alex Brown', action: 'placed order', target: '#ORD-4520', time: '3 hours ago' },
]

// Dummy recent orders
const recentOrders = [
  { id: 'ORD-4523', customer: 'Emma Wilson', amount: '$129.00', status: 'completed' },
  { id: 'ORD-4522', customer: 'James Lee', amount: '$89.50', status: 'pending' },
  { id: 'ORD-4521', customer: 'John Doe', amount: '$256.00', status: 'processing' },
  { id: 'ORD-4520', customer: 'Alex Brown', amount: '$45.99', status: 'completed' },
  { id: 'ORD-4519', customer: 'Olivia Davis', amount: '$189.00', status: 'completed' },
]

// Dummy traffic sources (for mini donut / distribution)
const trafficSources = [
  { name: 'Direct', value: 42, color: 'chart-1' },
  { name: 'Organic', value: 28, color: 'chart-2' },
  { name: 'Referral', value: 18, color: 'chart-3' },
  { name: 'Social', value: 12, color: 'chart-4' },
]
</script>

<template>
  <SidebarLayout>
    <template #header>
      <div class="flex items-center justify-between gap-1 flex-1">
        <h1 class="text-xl font-semibold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">
          Welcome back, <span class="font-medium text-foreground">{{ user?.name }}</span>
        </p>
      </div>
    </template>

    <div class="space-y-6 pb-8">
      <!-- KPI Stat Cards -->
      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.title"
          class="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-muted-foreground">{{ stat.title }}</p>
            <div
              :class="[
                'flex size-9 items-center justify-center rounded-lg',
                stat.color === 'chart-1' && 'bg-chart-1/10 text-chart-1',
                stat.color === 'chart-2' && 'bg-chart-2/10 text-chart-2',
                stat.color === 'chart-3' && 'bg-chart-3/10 text-chart-3',
                stat.color === 'chart-4' && 'bg-chart-4/10 text-chart-4',
              ]"
            >
              <component :is="stat.icon" class="size-4" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between gap-2">
            <span class="text-2xl font-bold tracking-tight">{{ stat.value }}</span>
            <span
              :class="[
                'inline-flex items-center gap-0.5 text-xs font-medium',
                stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
              ]"
            >
              <component :is="stat.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="size-3.5" />
              {{ stat.change }}
            </span>
          </div>
          <p class="mt-1 text-xs text-muted-foreground">vs last month</p>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Revenue Chart -->
        <section
          class="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold">Revenue Overview</h2>
            <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BarChart3 class="size-4" />
              Last 6 months
            </div>
          </div>
          <div class="mt-6 flex h-48 items-end gap-2">
            <div
              v-for="(item, i) in chartData"
              :key="item.month"
              class="flex flex-1 flex-col items-center gap-2"
            >
              <div
                class="w-full min-h-[4px] rounded-t transition-all hover:opacity-90"
                :style="{
                  height: `${(item.value / maxChartValue) * 100}%`,
                  backgroundColor: `var(--chart-${((i % 5) + 1)})`,
                }"
              />
              <span class="text-xs font-medium text-muted-foreground">{{ item.month }}</span>
            </div>
          </div>
        </section>

        <!-- Traffic Sources -->
        <section class="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 class="text-base font-semibold">Traffic Sources</h2>
          <div class="mt-4 space-y-4">
            <div
              v-for="source in trafficSources"
              :key="source.name"
              class="flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-2">
                <div
                  class="size-3 rounded-full"
                  :class="{
                    'bg-chart-1': source.color === 'chart-1',
                    'bg-chart-2': source.color === 'chart-2',
                    'bg-chart-3': source.color === 'chart-3',
                    'bg-chart-4': source.color === 'chart-4',
                  }"
                />
                <span class="text-sm">{{ source.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="{
                      'bg-chart-1': source.color === 'chart-1',
                      'bg-chart-2': source.color === 'chart-2',
                      'bg-chart-3': source.color === 'chart-3',
                      'bg-chart-4': source.color === 'chart-4',
                    }"
                    :style="{ width: `${source.value}%` }"
                  />
                </div>
                <span class="w-8 text-right text-sm text-muted-foreground">{{ source.value }}%</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Activity & Recent Orders -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Recent Activity -->
        <section class="rounded-lg border border-border bg-card shadow-sm">
          <div class="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 class="text-base font-semibold">Recent Activity</h2>
            <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity class="size-4" />
              Live
            </div>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="flex items-start gap-4 px-6 py-3 transition-colors hover:bg-muted/30"
            >
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock class="size-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm">
                  <span class="font-medium">{{ activity.user }}</span>
                  {{ activity.action }}
                  <span v-if="activity.target" class="font-medium text-primary">{{ activity.target }}</span>
                </p>
                <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Orders -->
        <section class="rounded-lg border border-border bg-card shadow-sm">
          <div class="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 class="text-base font-semibold">Recent Orders</h2>
            <span class="text-sm text-muted-foreground">View all</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead class="text-right">Amount</TableHead>
                <TableHead class="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="order in recentOrders"
                :key="order.id"
                class="transition-colors hover:bg-muted/30"
              >
                <TableCell class="font-medium">{{ order.id }}</TableCell>
                <TableCell>{{ order.customer }}</TableCell>
                <TableCell class="text-right">{{ order.amount }}</TableCell>
                <TableCell class="text-right">
                  <Badge
                    :variant="
                      order.status === 'completed'
                        ? 'default'
                        : order.status === 'processing'
                          ? 'secondary'
                          : 'outline'
                    "
                  >
                    {{ order.status }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </div>

      <!-- Quick Stats Row -->
      <section class="flex flex-wrap gap-4">
        <div class="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div class="flex size-10 items-center justify-center rounded-lg bg-chart-1/10">
            <TrendingUp class="size-5 text-chart-1" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Avg. Session</p>
            <p class="font-semibold">4m 32s</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div class="flex size-10 items-center justify-center rounded-lg bg-chart-2/10">
            <Users class="size-5 text-chart-2" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Bounce Rate</p>
            <p class="font-semibold">42.5%</p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div class="flex size-10 items-center justify-center rounded-lg bg-chart-3/10">
            <ShoppingCart class="size-5 text-chart-3" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Cart Value</p>
            <p class="font-semibold">$124.50</p>
          </div>
        </div>
      </section>
    </div>
  </SidebarLayout>
</template>
