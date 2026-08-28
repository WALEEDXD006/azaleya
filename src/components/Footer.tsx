import { Instagram, Mail } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="border-t border-cream-100 bg-cream-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-semibold text-cream-800">AZALEYA</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-600">
              Timeless clothing crafted from natural fabrics. Designed in warm, earthy tones for the
              modern wardrobe.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com/azaleya_official_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-cream-200 bg-white px-4 py-2 text-sm font-medium text-cream-700 transition-colors hover:bg-cream-100"
              >
                <Instagram size={16} />
                @azaleya_official_
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-500">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream-600">
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-cream-800">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?cat=dresses')} className="hover:text-cream-800">
                  Dresses
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?cat=tops')} className="hover:text-cream-800">
                  Tops
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop?cat=accessories')} className="hover:text-cream-800">
                  Accessories
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-500">Help</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream-600">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-cream-800">
                  About Us
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> hello@azaleya.shop
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-cream-100 pt-6 text-center text-xs text-cream-500">
          © {new Date().getFullYear()} Azaleya. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
