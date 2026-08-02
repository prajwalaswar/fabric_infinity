import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  useGetDashboardStats, 
  useGetDashboardSalesChart, 
  useGetDashboardTopProducts,
  useGetDashboardRecentOrders
} from '@workspace/api-client-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Link } from 'wouter';
import { IndianRupee, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetDashboardSalesChart({ months: 6 });
  const { data: topProducts, isLoading: topLoading } = useGetDashboardTopProducts({ limit: 5 });
  const { data: recentOrders, isLoading: ordersLoading } = useGetDashboardRecentOrders({ limit: 5 });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '₹0'}
          subtitle={stats?.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% from last month` : undefined}
          icon={IndianRupee}
          loading={statsLoading}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders?.toString() || '0'}
          subtitle={stats?.pendingOrders ? `${stats.pendingOrders} pending fulfillment` : undefined}
          icon={ShoppingBag}
          loading={statsLoading}
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers?.toString() || '0'}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats?.lowStockCount?.toString() || '0'}
          subtitle="Items with < 5 quantity"
          icon={AlertTriangle}
          loading={statsLoading}
          alert={stats?.lowStockCount ? stats.lowStockCount > 0 : false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Revenue Over Time</h2>
          {chartLoading ? (
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded animate-pulse"></div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          
          {topLoading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted/30 rounded animate-pulse"></div>)}
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts?.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                    {product.image && <img src={product.image} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{product.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
              {(!topProducts || topProducts.length === 0) && (
                <p className="text-muted-foreground text-sm text-center py-4">No data available yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all orders</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ordersLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading...</td></tr>
              ) : recentOrders?.length ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">{order.orderNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${order.orderStatus === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, loading, alert }: any) {
  return (
    <div className={`bg-card border rounded-xl p-6 shadow-sm ${alert ? 'border-destructive ring-1 ring-destructive/20' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-lg ${alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <Icon size={18} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-muted/30 rounded w-1/2 animate-pulse mb-1"></div>
      ) : (
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      )}
      {subtitle && (
        <p className={`text-xs ${alert ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{subtitle}</p>
      )}
    </div>
  );
}
