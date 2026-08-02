import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminListCustomers } from '@workspace/api-client-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users } from 'lucide-react';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminListCustomers({ search, page, limit: 20 });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Customers</h1>
        <p className="text-muted-foreground mt-1">All customers who have placed orders</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
              data-testid="input-customer-search"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium text-center">Orders</th>
                <th className="px-6 py-4 font-medium text-right">Total Spent</th>
                <th className="px-6 py-4 font-medium text-right">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading customers...</td></tr>
              ) : !data?.customers?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Users size={32} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-muted-foreground">No customers found</p>
                  </td>
                </tr>
              ) : (
                data.customers.map(c => (
                  <tr key={c.customerEmail} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{c.customerName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{c.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{c.customerPhone || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">{c.orderCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">₹{c.totalSpent?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                      {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > 20 && (
          <div className="p-4 border-t border-border flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{data.total} customers total</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} data-testid="button-prev-page">Previous</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total} data-testid="button-next-page">Next</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
