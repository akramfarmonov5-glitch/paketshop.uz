import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Order, Product } from '../types';
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
    <div className="min-h-screen pt-28 pb-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gold-400/20 text-gold-500 rounded-full flex items-center justify-center mb-4">
              <UserIcon size={32} />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white truncate w-full text-center">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </h2>
            <p className="text-sm text-gray-500 truncate w-full text-center">{user.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-gold-400 text-black font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Package size={20} />
              Mening buyurtmalarim
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'wishlist' 
                  ? 'bg-gold-400 text-black font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Heart size={20} />
              Sevimlilar ro'yxati
            </button>
            <hr className="my-4 border-gray-200 dark:border-white/10" />
            <button
              onClick={() => { signOut(); onBack(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              Chiqish
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gold-400" size={32} />
            </div>
          ) : activeTab === 'orders' ? (
            <div>
              <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Xaridlar tarixi</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Hali hech qanday buyurtma qilmadingiz.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-gray-500">#{order.id}</span>
                            <span className="text-xs bg-gold-400/20 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded-full">
                                {order.status}
                            </span>
                        </div>
                        <p className="font-bold text-black dark:text-white">{new Intl.NumberFormat('uz-UZ').format(order.total)} UZS</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-lg">
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
              <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Sevimlilar</h3>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Heart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Sevimlilar ro'yxati bo'sh.</p>
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
