import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { CartProvider } from '@/contexts/CartContext';
import { AdminGuard } from '@/components/admin/AdminGuard';

// Public Pages
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import TrackOrder from '@/pages/TrackOrder';

// Admin Pages
import AdminLogin from '@/pages/admin/Login';
import Dashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/Products';
//import AdminProductForm from '@/pages/admin/ProductForm';
import AdminOrders from '@/pages/admin/Orders';
//import AdminOrderDetail from '@/pages/admin/OrderDetail';
import AdminCategories from '@/pages/admin/Categories';
//import AdminSettings from '@/pages/admin/Settings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public Storefront */}
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation/:orderNumber" component={OrderConfirmation} />
      <Route path="/track-order" component={TrackOrder} />

      {/* Admin Auth */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Protected Admin Routes */}
      <Route path="/admin">
        <AdminGuard><Dashboard /></AdminGuard>
      </Route>
      <Route path="/admin/products">
        <AdminGuard><AdminProducts /></AdminGuard>
      </Route>
      {/* 
      <Route path="/admin/products/new">
        <AdminGuard><AdminProductForm /></AdminGuard>
      </Route>
      <Route path="/admin/products/:id/edit">
        <AdminGuard><AdminProductForm /></AdminGuard>
      </Route>
      */}
      <Route path="/admin/orders">
        <AdminGuard><AdminOrders /></AdminGuard>
      </Route>
      {/* 
      <Route path="/admin/orders/:id">
        <AdminGuard><AdminOrderDetail /></AdminGuard>
      </Route>
      */}
      <Route path="/admin/categories">
        <AdminGuard><AdminCategories /></AdminGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
