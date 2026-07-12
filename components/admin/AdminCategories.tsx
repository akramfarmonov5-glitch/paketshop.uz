import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, X, Save, Image as ImageIcon, Globe, Type, Layout, Sparkles, Loader2 } from 'lucide-react';
import { Category, LocalizedString } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { requestGeminiJson } from '../../lib/geminiApi';
import { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';
import { slugify } from '../../lib/slugify';
import { getCategorySlug } from '../../lib/categoryUtils';

interface AdminCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

type Lang = 'uz' | 'ru';

type CategoryFormData = {
  id?: number;
  name: LocalizedString;
  slug: LocalizedString;
  image: string;
  description: LocalizedString;
  description: LocalizedString;
};

const LANGUAGES: Lang[] = ['uz', 'ru'];

const emptyLocalizedString = (): LocalizedString => ({
  uz: '',
  ru: '',
  ru: '',
});

const createEmptyFormData = (): CategoryFormData => ({
  name: emptyLocalizedString(),
  slug: emptyLocalizedString(),
  image: '',
  description: emptyLocalizedString(),
  description: emptyLocalizedString(),
});

const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, setCategories }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeLang, setActiveLang] = useState<Lang>('uz');
  const [formData, setFormData] = useState<CategoryFormData>(createEmptyFormData());

  const updateLocalizedField = (field: 'name' | 'description', lang: Lang, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const updateSlug = (lang: Lang, value: string) => {
    setFormData(prev => ({
      ...prev,
      slug: {
        ...prev.slug,
        [lang]: value,
      },
    }));
  };

  const handleOpenAdd = () => {
    setActiveLang('uz');
    setSaveError('');
    setFormData(createEmptyFormData());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setActiveLang('uz');
    setSaveError('');
    setFormData({
      id: category.id,
      name: parseLocalizedObject(category.name),
      slug: parseLocalizedObject(category.slug),
      image: category.image || '',
      description: parseLocalizedObject(category.description),
      description: parseLocalizedObject(category.description),
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
        console.error('Delete error:', error);
        showToast("O'chirishda xatolik: " + (error as Error).message, 'error');
      }
    }
  };

  const generateCategoryDetails = async () => {
    if (!formData.name.uz.trim()) {
      showToast("Iltimos, avval kategoriya nomini o'zbek tilida yozing.", 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await requestGeminiJson<{
        slugUz: string;
        slugRu: string;
        slugEn: string;
        descriptionUz: string;
        descriptionRu: string;
        descriptionEn: string;
      }>({
        systemInstruction: 'Act as a multilingual e-commerce content strategist. Always answer in valid JSON.',
        message: `
          Category name:
          Uzbek: "${formData.name.uz}"
          Russian: "${formData.name.ru}"
          English: "${formData.name.en}"

          Generate:
          1. slugUz: a clean kebab-case URL slug based on the Uzbek category name
          2. slugRu: a clean kebab-case latin transliteration URL slug based on the Russian category name
          3. slugEn: a clean kebab-case URL slug based on the English category name
          4. descriptionUz: short elegant Uzbek description (max 1 sentence)
          5. descriptionRu: short elegant Russian description (max 1 sentence)
          6. descriptionEn: short elegant English description (max 1 sentence)

          Return JSON:
          {
            "slugUz": "...",
            "slugRu": "...",
            "slugEn": "...",
            "descriptionUz": "...",
            "descriptionRu": "...",
            "descriptionEn": "..."
          }
        `,
      });

      setFormData(prev => ({
        ...prev,
        slug: {
          uz: data.slugUz || slugify(prev.name.uz),
          ru: data.slugRu || slugify(prev.name.ru || prev.name.uz),
          en: data.slugEn || slugify(prev.name.en || prev.name.uz),
        },
        description: {
          uz: data.descriptionUz || prev.description.uz,
          ru: data.descriptionRu || prev.description.ru,
          en: data.descriptionEn || prev.description.en,
        },
      }));
    } catch (error) {
      console.error('AI Gen Error', error);
      showToast('AI tavsif yaratishda xatolik yuz berdi.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    if (!formData.name.uz.trim()) {
      showToast("Kategoriya nomining o'zbekcha varianti majburiy.", 'warning');
      return;
    }

    const slugs: LocalizedString = {
      uz: formData.slug.uz.trim() || slugify(formData.name.uz),
      ru: formData.slug.ru.trim() || slugify(formData.name.ru || formData.name.uz),
      en: formData.slug.en.trim() || slugify(formData.name.en || formData.name.uz),
    };

    const dataToSave = {
      name: JSON.stringify(formData.name),
      slug: JSON.stringify(slugs),
      image: formData.image.trim() || 'https://via.placeholder.com/400',
      description: JSON.stringify(formData.description),
      description: JSON.stringify(formData.description),
    };

    const saveWithPayload = async (payload: typeof dataToSave) => {
      if (formData.id) {
        return supabase
          .from('categories')
          .update(payload)
          .eq('id', formData.id)
          .select()
          .single();
      }

      return supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();
    };

    try {
      setIsSaving(true);
      setSaveError('');

      let { data, error } = await saveWithPayload(dataToSave);

      if (error) throw error;

      if (formData.id) {
        setCategories(prev => prev.map(c => (c.id === formData.id ? (data as Category) : c)));
      } else {
        setCategories(prev => [data as Category, ...prev]);
      }

      setIsModalOpen(false);
      setFormData(createEmptyFormData());
      showToast('Kategoriya muvaffaqiyatli saqlandi.', 'success');
    } catch (error) {
      console.error('Save error:', error);
      const message = (error as Error).message || "Noma'lum xatolik yuz berdi.";
      setSaveError(message);
      showToast("Saqlashda xatolik: " + message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const localizedName = getLocalizedText(category.name, 'uz').toLowerCase();
    return localizedName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Kategoriyalar</h2>
          <p className="text-slate-500">Do'kon bo'limlarini boshqarish.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-black font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          Yangi Kategoriya
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Kategoriya nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 group hover:border-gold-400/50 transition-all">
            <div className="w-24 aspect-[4/5] rounded-xl bg-gray-800 overflow-hidden shrink-0 relative border border-slate-100">
              <img src={category.image} alt={getLocalizedText(category.name, 'uz')} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">{getLocalizedText(category.name, 'uz')}</h3>
                <p className="text-xs text-slate-400 font-mono truncate">/{getCategorySlug(category, 'uz')}</p>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 text-xs">{getLocalizedText(category.description, 'uz') || "Tavsif yo'q"}</p>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => handleOpenEdit(category)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {formData.id ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center justify-between gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Globe size={18} />
                  <span>
                    Hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kirityapsiz.
                  </span>
                </div>
                <div className="flex rounded-xl bg-white/40 p-1 border border-slate-200">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                        activeLang === lang
                          ? 'bg-red-600 text-black'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2">
                  <Type size={16} /> Nomi
                </label>
                <div className="flex gap-2">
                  <input
                    required={activeLang === 'uz'}
                    type="text"
                    value={formData.name[activeLang]}
                    onChange={e => updateLocalizedField('name', activeLang, e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none transition-colors"
                    placeholder={activeLang === 'uz' ? 'Masalan: Paketlar' : activeLang === 'ru' ? 'Например: Пакеты' : 'For example: Bags'}
                  />
                  <button
                    type="button"
                    onClick={generateCategoryDetails}
                    disabled={isGenerating || !formData.name.uz.trim()}
                    className="px-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                    title="AI yordamida tavsif yaratish"
                  >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-current rounded-full animate-spin" /> : <Sparkles size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2">
                  <Globe size={16} /> Slug (URL manzili)
                </label>
                <input
                  type="text"
                  value={formData.slug[activeLang]}
                  onChange={e => updateSlug(activeLang, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none transition-colors font-mono text-sm"
                  placeholder={activeLang === 'uz' ? "polietilen-paketlar" : activeLang === 'ru' ? 'polietilenovye-pakety' : 'polyethylene-bags'}
                />
                <p className="text-[10px] text-slate-400 ml-1">Har bir til uchun alohida SEO-friendly URL yoziladi. Bo'sh qolsa nomdan avtomatik yaratiladi.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2">
                  <ImageIcon size={16} /> Rasm URL
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      required
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none transition-colors"
                      placeholder="https://..."
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Kvadrat yoki vertikal rasm tavsiya etiladi.</p>
                  </div>
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
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
                <label className="text-sm text-slate-500 flex items-center gap-2">
                  <Layout size={16} /> Tavsif
                </label>
                <textarea
                  value={formData.description[activeLang]}
                  onChange={e => updateLocalizedField('description', activeLang, e.target.value)}
                  className="w-full h-28 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none resize-none transition-colors custom-scrollbar"
                  placeholder="Kategoriya haqida qisqacha ma'lumot..."
                />
              </div>


              <div className="grid grid-cols-3 gap-3 rounded-xl bg-white/30 border border-slate-100 p-3 text-xs">
                {LANGUAGES.map((lang) => (
                  <div key={lang} className="space-y-1">
                    <p className="font-bold uppercase text-red-600">{lang}</p>
                    <p className="text-slate-900 truncate">{formData.name[lang] || '-'}</p>
                    <p className="text-slate-400 line-clamp-2">{formData.description[lang] || 'Tavsif yo‘q'}</p>
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  Saqlashda xatolik: {saveError}
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gold-400/20 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
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
