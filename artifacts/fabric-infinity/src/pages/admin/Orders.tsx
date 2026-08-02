import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminListOrders, useAdminUpdateOrder } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useAdminListOrders({ 
    search, 
    status: statusFilter,
    page, 
    limit: 10 
  });
  
  const updateOrder = useAdminUpdateOrder();

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateOrder.mutateAsync({ id, data: { orderStatus: newStatus } });
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update failed", description: e.message });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      case 'packed': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200';
      case 'shipped': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track customer orders</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search by order ID, name, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading orders...</td></tr>
              ) : data?.orders.length ? (
                data.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="uppercase text-xs font-semibold">{order.paymentMethod}</span>
                        <span className={`text-[10px] inline-block px-1.5 rounded-sm w-fit mt-1 uppercase font-bold tracking-wider ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                          order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Select 
                        defaultValue={order.orderStatus} 
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                      >
                        <SelectTrigger className={`h-8 text-xs border uppercase tracking-wider font-bold ${getStatusColor(order.orderStatus)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye size={16} /></Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data && data.total > data.limit && (
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted/10">
            <span className="text-sm text-muted-foreground">Showing {(page-1)*data.limit + 1} to {Math.min(page*data.limit, data.total)} of {data.total} entries</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p=>Math.max(1, p-1))} disabled={page===1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p=>p+1)} disabled={page*data.limit >= data.total}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
