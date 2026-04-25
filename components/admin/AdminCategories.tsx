
import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, X, Save, Image as ImageIcon, Globe, Type, Layout, Sparkles } from 'lucide-react';
import { Category } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { requestGeminiJson } from '../../lib/geminiApi';
import { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';

interface AdminCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, setCategories }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    image: '',
    description: '',
    googleProductCategory: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      googleProductCategory: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setFormData({
      ...category,
      description: category.description || '',
      googleProductCategory: category.googleProductCategory || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu kategoriyani o'chirmoqchimisiz?")) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        setCategories(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Delete error:", error);
        showToast("O'chirishda xatolik: " + (error as any).message, 'error');
      }
    }
  };

  const generateCategoryDetails = async () => {
    if (!formData.name) {
      showToast("Iltimos, avval Kategoriya nomini yozing.", 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await requestGeminiJson<{
        description: string;
        slug: string;
      }>({
        systemInstruction: 'Act as a luxury e-commerce content strategist. Always answer in valid JSON.',
        message: `
          Category name: "${formData.name}"

          Generate:
          1. description: a short elegant description in Uzbek (max 1 sentence)
          2. slug: a clean kebab-case URL slug

          Return JSON:
          {
            "description": "...",
            "slug": "..."
          }
        `,
      });

      setFormData(prev => ({
        ...prev,
        description: data.description,
        slug: data.slug
      }));
    } catch (error) {
      console.error("AI Gen Error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '';

    const dataToSave = {
      name: formData.name,
      slug,
      image: formData.image || 'https://via.placeholder.com/400',
      description: formData.description || '',
      googleProductCategory: formData.googleProductCategory || '',
    };

    try {
      if (formData.id) {
        // Update
        const { data, error } = await supabase
          .from('categories')
          .update(dataToSave)
          .eq('id', formData.id)
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          const newCategory = {
            ...data[0],
            slug: slug || data[0].name.toLowerCase().replace(/\s+/g, '-')
          };
          setCategories(prev => prev.map(c => c.id === formData.id ? (newCategory as Category) : c));
        }
      } else {
        // Insert - DB will auto-generate ID
        const { data, error } = await supabase
          .from('categories')
          .insert([dataToSave])
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          const newCategory = {
            ...data[0],
            slug: slug || data[0].name.toLowerCase().replace(/\s+/g, '-')
          };
          setCategories(prev => [(newCategory as Category), ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      showToast("Saqlashda xatolik: " + (error as any).message, 'error');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Kategoriyalar</h2>
          <p className="text-gray-400">Do'kon bo'limlarini boshqarish.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-black font-bold rounded-xl hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} />
          Yangi Kategoriya
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Kategoriya nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex gap-4 group hover:border-gold-400/50 transition-all">
            <div className="w-24 h-24 rounded-xl bg-gray-800 overflow-hidden shrink-0 relative border border-white/5">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors truncate">{getLocalizedText(category.name, 'uz')}</h3>
                <p className="text-xs text-gray-500 font-mono truncate">/{category.slug}</p>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2 text-xs">{getLocalizedText(category.description, 'uz') || "Tavsif yo'q"}</p>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => handleOpenEdit(category)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
                  title="Tahrirlash"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                  title="O'chirish"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-zinc-900 z-10 pb-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-2 mb-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                  <Globe size={18} />
                  <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Type size={16} /> Nomi
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={formData.name?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                    placeholder="Masalan: Soatlar"
                  />
                  <button
                    type="button"
                    onClick={generateCategoryDetails}
                    disabled={isGenerating || !formData.name?.uz}
                    className="px-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                    title="AI yordamida to'ldirish"
                  >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-current rounded-full animate-spin" /> : <Sparkles size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Globe size={16} /> Slug (URL manzili)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors font-mono text-sm"
                  placeholder="soatlar (bo'sh qolsa avtomatik)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <ImageIcon size={16} /> Rasm URL
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      required
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none transition-colors"
                      placeholder="https://..."
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5 ml-1">Kvadrat yoki vertikal rasm tavsiya etiladi.</p>
                  </div>
                  <div className="w-14 h-14 rounded-lg bg-black border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Layout size={16} /> Tavsif (Description)
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-28 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none resize-none transition-colors custom-scrollbar"
                  placeholder="Kategoriya haqida qisqacha ma'lumot..."
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-sm text-gray-400">Google Product Category (Facebook Catalog)</label>
                <input
                  type="text"
                  value={formData.googleProductCategory || ''}
                  onChange={e => setFormData({ ...formData, googleProductCategory: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none text-xs font-mono transition-colors"
                  placeholder="Apparel & Accessories > Jewelry > Watches"
                />
                <p className="text-[10px] text-gray-500 ml-1">Facebook va Instagram do'koni integratsiyasi uchun kerak.</p>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-gold-400 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20">
                  <Save size={18} />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
