import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, FileText, LogOut, Layers, Image as ImageIcon, Menu, Users, X, FileUp, Route } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminProductsV2 from './AdminProductsV2';
import AdminCategoriesV2 from './AdminCategoriesV2';
import AdminProductImport from './AdminProductImport';
import AdminOrders from './AdminOrders';
import AdminBlog from './AdminBlog';
import AdminHero from './AdminHero';
import AdminNavigation from './AdminNavigation';
import AdminLeadsV2 from './AdminLeadsV2';
import AdminRedirects from './AdminRedirects';
import { Product, Category, HeroContent, NavigationSettings, BlogPost } from '../../types';

interface AdminLayoutProps {
  onLogout: () => void | Promise<void>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  heroContent: HeroContent;
  setHeroContent: React.Dispatch<React.SetStateAction<HeroContent>>;
  navigationSettings?: NavigationSettings;
  setNavigationSettings?: React.Dispatch<React.SetStateAction<NavigationSettings>>;
  blogPosts?: BlogPost[]; 
  setBlogPosts?: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
    onLogout, 
    products, 
    categories, 
    heroContent,
    setHeroContent,
    navigationSettings,
    setNavigationSettings,
    blogPosts,
    setBlogPosts
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'import' | 'orders' | 'leads' | 'blog' | 'hero' | 'navigation' | 'redirects'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Statistika', icon: LayoutDashboard },
    { id: 'orders', label: 'Buyurtmalar (CRM)', icon: ShoppingCart },
    { id: 'leads', label: 'Leadlar', icon: Users },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'categories', label: 'Kategoriyalar', icon: Layers },
    { id: 'import', label: 'Import / eksport', icon: FileUp },
    { id: 'redirects', label: 'Redirectlar', icon: Route },
    { id: 'blog', label: 'SEO Blog & AI', icon: FileText },
    { id: 'hero', label: 'Banner (Hero)', icon: ImageIcon },
    { id: 'navigation', label: 'Navigatsiya', icon: Menu },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard products={products} />;
      case 'hero':
        return <AdminHero heroContent={heroContent} setHeroContent={setHeroContent} />;
      case 'navigation':
        if (navigationSettings && setNavigationSettings) {
            return (
                <AdminNavigation 
                    navigationSettings={navigationSettings} 
                    setNavigationSettings={setNavigationSettings} 
                    categories={categories} 
                />
            );
        }
        return <div>Loading...</div>;
      case 'categories':
        return <AdminCategoriesV2 />;
      case 'products':
        return <AdminProductsV2 />;
      case 'import':
        return <AdminProductImport />;
      case 'redirects':
        return <AdminRedirects />;
      case 'orders':
        return <AdminOrders />;
      case 'leads':
        return <AdminLeadsV2 />;
      case 'blog':
        if (blogPosts && setBlogPosts) {
            return <AdminBlog posts={blogPosts} setPosts={setBlogPosts} />;
        }
        return <div>Blog posts loading...</div>;
      default:
        return <AdminDashboard products={products} />;
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex text-slate-900 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold tracking-wider text-slate-900">
          Paket<span className="text-red-600">ADMIN</span>
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-white/60 backdrop-blur-sm z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-wider text-slate-900">
            Paket<span className="text-red-600">ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Management Console</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-gold-500/10 text-red-600 border border-gold-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminLayout;
