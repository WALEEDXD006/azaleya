export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  city: string;
  postal_code: string | null;
  country: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type Profile = {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export type ShippingRate = {
  id: string;
  city: string;
  rate: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  size: string;
  color: string;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
};
