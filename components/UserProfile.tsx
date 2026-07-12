import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

interface Order {
  id: string;
  total: number;
  date: string;
  status?: string;
  paymentMethod?: string;
}
import { LogOut, Package, Heart, User as UserIcon, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

interface UserProfileProps {
  onBack: () => void;
  onNavigateToProduct: (id: number) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onNavigateToProduct }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        onBack();
        return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderData) {
          setOrders(orderData as Order[]);
        }

        // Fetch Wishlist
        const { data: wishlistData } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);

        if (wishlistData && wishlistData.length > 0) {
          const productIds = wishlistData.map(w => w.product_id);
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
            
          if (products) {
              setWishlistItems(products as Product[]);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-28 pb-12 transition-colors duration-300 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-4">
              <UserIcon size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 truncate w-full text-center">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </h2>
            <p className="text-sm text-slate-500 truncate w-full text-center font-medium">{user.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-red-50 text-red-700 font-bold border border-red-100' 
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <Package size={20} />
              Mening buyurtmalarim
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'wishlist' 
                  ? 'bg-red-50 text-red-700 font-bold border border-red-100' 
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <Heart size={20} />
              Sevimlilar ro'yxati
            </button>
            <hr className="my-4 border-slate-200" />
            <button
              onClick={() => { signOut(); onBack(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Chiqish
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : activeTab === 'orders' ? (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900">Xaridlar tarixi</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package size={48} className="mx-auto mb-4 opacity-30 text-slate-400" />
                  <p className="font-medium">Hali hech qanday buyurtma qilmadingiz.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-slate-500">#{order.id.slice(0, 8)}</span>
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                                {order.status}
                            </span>
                        </div>
                        <p className="font-bold text-slate-900">{new Intl.NumberFormat('uz-UZ').format(order.total)} UZS</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">{new Date(order.date).toLocaleDateString('uz-UZ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-slate-600 font-medium border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-slate-900">Sevimlilar</h3>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Heart size={48} className="mx-auto mb-4 opacity-30 text-slate-400" />
                  <p className="font-medium">Sevimlilar ro'yxati bo'sh.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistItems.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onNavigate={() => onNavigateToProduct(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
