
import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, Check, X, Save, PlusCircle, MinusCircle, Image as ImageIcon, Youtube, Wand2, Sparkles, Box, Globe } from 'lucide-react';
import { Product, Category } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import CloudinaryUpload from '../CloudinaryUpload';
import { requestGeminiJson } from '../../lib/geminiApi';
import { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';

interface AdminProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, setProducts, categories }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');
  const [formData, setFormData] = useState<any>({
    name: '',
    category: '',
    price: 0,
    image: '',
    images: [],
    videoUrl: '',
    shortDescription: '',
    stock: 0,
    itemsPerPackage: 1,
    specs: []
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: categories.length > 0 ? categories[0].name : '',
      price: 0,
      image: '',
      images: [''],
      videoUrl: '',
      shortDescription: '',
      stock: 0,
      itemsPerPackage: 1,
      specs: [{ label: '', value: '' }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    const images = product.images && product.images.length > 0
      ? product.images
      : [product.image];

    setFormData({
      ...product,
      images: images
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) {
          console.error('Error deleting product:', error);
          showToast("O'chirishda xatolik yuz berdi", 'error');
          return;
        }

        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  const generateProductDetails = async () => {
    if (!formData.name || !formData.category) {
      showToast("Iltimos, avval Mahsulot nomi va Kategoriyani tanlang.", 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await requestGeminiJson<{
        shortDescription: string;
        specs: { label: string; value: string }[];
      }>({
        systemInstruction: 'You are a luxury product expert for an online store. Always answer in valid JSON.',
        message: `
          Product name: "${formData.name?.uz || formData.name}"
          Category: "${formData.category}"

          Generate in Uzbek language (Latin script):
          1. A short premium description (max 2 sentences).
          2. 4 key technical specifications relevant to this product.

          Return JSON with this exact shape:
          {
            "shortDescription": "...",
            "specs": [
              { "label": "...", "value": "..." }
            ]
          }
        `,
      });

      setFormData(prev => ({
        ...prev,
        shortDescription: data.shortDescription,
        specs: data.specs
      }));
    } catch (error) {
      console.error("AI Error:", error);
      showToast("AI ma'lumot yaratishda xatolik yuz berdi.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPrice = new Intl.NumberFormat('uz-UZ').format(Number(formData.price)) + ' UZS';

    const validImages = formData.images?.filter(url => url.trim() !== '') || [];
    const mainImage = validImages.length > 0 ? validImages[0] : (formData.image || 'https://via.placeholder.com/400');

    // Tayyorlash
    const dataToSave: Record<string, any> = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      image: mainImage,
      images: validImages,
      description: formData.shortDescription,
      stock: Number(formData.stock),
      "itemsPerPackage": Number(formData.itemsPerPackage || 1),
      specifications: formData.specs
    };

    // videoUrl mavjud bo'lsa qo'shamiz
    if (formData.videoUrl && formData.videoUrl.trim() !== '') {
      dataToSave["videoUrl"] = formData.videoUrl.trim();
    } else {
      dataToSave["videoUrl"] = null;
    }

    try {
      if (formData.id) {
        // Update
        const { data, error } = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', formData.id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const newProduct = {
            ...data[0],
            formattedPrice: new Intl.NumberFormat('uz-UZ').format(Number(data[0].price)) + ' UZS',
            shortDescription: data[0].description || '',
            specs: data[0].specifications || [],
            videoUrl: data[0].videoUrl || ''
          };
          setProducts(prev => prev.map(p => p.id === formData.id ? (newProduct as Product) : p));
        }
      } else {
        // Insert - DB will auto-generate ID
        const { data, error } = await supabase
          .from('products')
          .insert([dataToSave])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const newProduct = {
            ...data[0],
            formattedPrice: new Intl.NumberFormat('uz-UZ').format(Number(data[0].price)) + ' UZS',
            shortDescription: data[0].description || '',
            specs: data[0].specifications || [],
            videoUrl: data[0].videoUrl || ''
          };
          setProducts(prev => [(newProduct as Product), ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      showToast("Saqlashda xatolik yuz berdi: " + (error as any).message, 'error');
    }
  };

  const updateSpec = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...(formData.specs || [])];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData({ ...formData, specs: newSpecs });
  };
  const addSpec = () => {
    setFormData({ ...formData, specs: [...(formData.specs || []), { label: '', value: '' }] });
  };
  const removeSpec = (index: number) => {
    const newSpecs = [...(formData.specs || [])];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, specs: newSpecs });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };
  const addImage = () => {
    if ((formData.images?.length || 0) < 4) {
      setFormData({ ...formData, images: [...(formData.images || []), ''] });
    }
  };
  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const filteredProducts = products.filter(p =>
    (typeof p.name === 'string' ? p.name : JSON.stringify(p.name)).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof p.category === 'string' ? p.category : JSON.stringify(p.category)).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Mahsulotlar Ombori</h2>
          <p className="text-gray-400">Jami {products.length} ta mahsulot mavjud.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-black font-bold rounded-xl hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} />
          Yangi Qo'shish
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Mahsulot nomi yoki kategoriya bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-400 focus:outline-none"
        />
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-400">Rasm</th>
              <th className="p-4 text-sm font-medium text-gray-400">Mahsulot Nomi</th>
              <th className="p-4 text-sm font-medium text-gray-400">Kategoriya</th>
              <th className="p-4 text-sm font-medium text-gray-400">Narx</th>
              <th className="p-4 text-sm font-medium text-gray-400">Stock</th>
              <th className="p-4 text-sm font-medium text-gray-400 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="w-12 aspect-[4/5] rounded-lg bg-gray-800 overflow-hidden relative">
                    <img src={product.image} alt={getLocalizedText(product.name, 'uz')} className="w-full h-full object-cover" />
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl">
                        +{product.images.length - 1}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium text-white">{getLocalizedText(product.name, 'uz')}</td>
                <td className="p-4 text-gray-400 text-sm">
                  <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10">
                    {getLocalizedText(product.category, 'uz')}
                  </span>
                </td>
                <td className="p-4 text-gold-400 text-sm">{product.formattedPrice}</td>
                <td className="p-4 text-white">
                  <span className={`text-sm ${!product.stock ? 'text-red-400' : 'text-gray-300'}`}>
                    {product.stock || 0} dona
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">
                  {formData.id ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot'}
                </h3>
                <button
                  type="button"
                  onClick={generateProductDetails}
                  disabled={isGenerating || !formData.name || !formData.category}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold hover:bg-purple-500/20 transition-all disabled:opacity-50"
                  title="AI yordamida tavsif va xususiyatlarni to'ldirish"
                >
                  {isGenerating ? <div className="w-3 h-3 border-2 border-purple-400 rounded-full animate-spin border-t-transparent" /> : <Sparkles size={14} />}
                  AI To'ldirish
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-black p-1 rounded-xl border border-white/10">
                  {(['uz', 'ru', 'en'] as const).map(l => (
                    <button key={l} type="button" onClick={() => setActiveLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeLang === l ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'}`}
                    >{l}</button>
                  ))}
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm mb-4">
              <Globe size={18} />
              <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nomi ({activeLang.toUpperCase()})</label>
                  <input
                    required={activeLang === 'uz'}
                    type="text"
                    value={formData.name?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                    placeholder="Masalan: Rolex Submariner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Kategoriya</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none appearance-none"
                  >
                    <option className="bg-zinc-900 text-white" value="" disabled>Tanlang</option>
                    {categories.map(cat => (
                      <option className="bg-zinc-900 text-white" key={cat.id} value={typeof cat.name === 'string' ? cat.name : cat.name?.uz}>{getLocalizedText(cat.name, 'uz')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Narxi (UZS)</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Stock (Dona)</label>
                  <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <Box size={14} className="text-gold-400" /> Qadoqdagi soni
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.itemsPerPackage}
                    onChange={e => setFormData({ ...formData, itemsPerPackage: Number(e.target.value) })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                    placeholder="Masalan: 100"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <ImageIcon size={16} /> Rasmlar (Max 4)
                  </label>
                  {(formData.images?.length || 0) < 4 && (
                    <button type="button" onClick={addImage} className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                      <PlusCircle size={14} /> Rasm qo'shish
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {formData.images?.map((url, index) => (
                    <div key={index} className="relative">
                      <CloudinaryUpload
                        currentImage={url}
                        label={`Rasm ${index + 1}`}
                        onUpload={(newUrl) => updateImage(index, newUrl)}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg text-xs z-10"
                        >
                          <MinusCircle size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Youtube size={16} className="text-red-500" /> YouTube Video URL
                </label>
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-gray-400">Qisqa Tavsif ({activeLang.toUpperCase()})</label>
                  {formData.shortDescription?.[activeLang] && (
                    <span className="text-[10px] text-purple-400 flex items-center gap-1">
                      <Wand2 size={10} /> AI Assisted
                    </span>
                  )}
                </div>
                <textarea
                  value={formData.shortDescription?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, [activeLang]: e.target.value } })}
                  className="w-full h-24 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none resize-none"
                  placeholder="Tavsif yozing yoki 'AI To'ldirish' tugmasini bosing..."
                />
              </div>

              <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-400">Xususiyatlar (Specs)</label>
                  <button type="button" onClick={addSpec} className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                    <PlusCircle size={14} /> Qo'shish
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.specs?.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nomi"
                        value={spec.label?.[activeLang] || ''}
                        onChange={(e) => {
                          const newSpecs = [...(formData.specs || [])];
                          newSpecs[index] = { ...newSpecs[index], label: { ...newSpecs[index].label, [activeLang]: e.target.value } };
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                        className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Qiymati"
                        value={spec.value?.[activeLang] || ''}
                        onChange={(e) => {
                          const newSpecs = [...(formData.specs || [])];
                          newSpecs[index] = { ...newSpecs[index], value: { ...newSpecs[index].value, [activeLang]: e.target.value } };
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                        className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                      <button type="button" onClick={() => removeSpec(index)} className="text-red-400 hover:text-red-300 p-2">
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
                  {(!formData.specs || formData.specs.length === 0) && (
                    <p className="text-center text-xs text-gray-600 py-2">Xususiyatlar qo'shilmadi.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3 bg-gold-400 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
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

export default AdminProducts;
