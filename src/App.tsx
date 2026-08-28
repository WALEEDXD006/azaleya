import { RouterProvider, useRouter, matchPath } from '@/context/RouterContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { AuthPage } from '@/pages/AuthPage';
import { AccountPage } from '@/pages/AccountPage';
import { AboutPage } from '@/pages/AboutPage';
import { AdminPage } from '@/pages/AdminPage';

function Routes() {
  const { path } = useRouter();
  const cleanPath = path.split('?')[0];

  const productMatch = matchPath('/product/:id', cleanPath);
  if (productMatch) return <ProductDetailPage id={productMatch.id} />;

  switch (cleanPath) {
    case '/':
      return <HomePage />;
    case '/shop':
      return <ShopPage />;
    case '/cart':
      return <CartPage />;
    case '/checkout':
      return <CheckoutPage />;
    case '/auth':
      return <AuthPage />;
    case '/account':
      return <AccountPage />;
    case '/about':
      return <AboutPage />;
    case '/admin':
      return <AdminPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-cream-50">
            <Navbar />
            <main className="flex-1">
              <Routes />
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
