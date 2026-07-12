import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { Sparkles, Image as ImageIcon, Plus, Trash2, Calendar, Wand2, Search, Edit, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { requestGeminiJson } from '../../lib/geminiApi';
import { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';
import { Globe } from 'lucide-react';
import { slugify } from '../../lib/slugify';

interface AdminBlogProps {
  posts: BlogPost[];
  setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const AdminBlog: React.FC<AdminBlogProps> = ({ posts, setPosts }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<'uz' | 'ru'>('uz');

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    image: '',
    content: '',
    seo: { title: '', description: '', keywords: [] },
    date: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      slug: { uz: '', ru: '' },
      image: '',
      content: '',
      seo: { title: '', description: '', keywords: [] },
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setFormData({
      ...post,
      title: parseLocalizedObject(post.title),
      slug: parseLocalizedObject(post.slug),
      content: parseLocalizedObject(post.content),
      seo: {
         title: parseLocalizedObject(post.seo?.title),
         description: parseLocalizedObject(post.seo?.description),
         keywords: parseLocalizedObject(post.seo?.keywords)
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu maqolani o'chirmoqchimisiz?")) {
      try {
        await supabase.from('blog_posts').delete().eq('id', id);
        setPosts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const generateContent = async () => {
    const topic = getLocalizedText(formData.title, activeLang) || getLocalizedText(formData.title, 'uz');

    if (!topic) {
      showToast("Iltimos, avval maqola mavzusi (Title)ni yozing.", 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await requestGeminiJson<{
        titleUz: string;
        titleRu: string;
        slugUz: string;
        slugRu: string;
        contentUz: string;
        contentRu: string;
        seo: {
          titleUz: string;
          titleRu: string;
          descriptionUz: string;
          descriptionRu: string;
          keywordsUz: string[];
          keywordsRu: string[];
        };
      }>({
        systemInstruction: 'You are an expert multilingual SEO content writer for a packaging materials and wholesale store in Uzbekistan. Always answer in valid JSON only.',
        message: `
          Topic: "${topic}"

          Generate the same blog article in 2 languages:
          1. Uzbek Latin script
          2. Russian

          Rules:
          - Uzbek fields must be Uzbek Latin only.
          - Russian fields must be Russian only.
          - Each content field should be around 150 words.
          - Slugs must be lowercase latin kebab-case.
          - SEO keywords must be arrays of 5 strings in the same language.

          Return JSON:
          {
            "titleUz": "...",
            "titleRu": "...",
            "slugUz": "...",
            "slugRu": "...",
            "contentUz": "...",
            "contentRu": "...",
            "seo": {
              "titleUz": "...",
              "titleRu": "...",
              "descriptionUz": "...",
              "descriptionRu": "...",
              "keywordsUz": ["...", "..."],
              "keywordsRu": ["...", "..."]
            }
          }
        `,
      });

      setFormData((prev: any) => ({
        ...prev,
        title: {
          uz: data.titleUz || prev.title?.uz || '',
          ru: data.titleRu || prev.title?.ru || '',
        },
        slug: {
          uz: data.slugUz || slugify(data.titleUz || prev.title?.uz || ''),
          ru: data.slugRu || slugify(data.titleRu || prev.title?.ru || ''),
        },
        content: {
          uz: data.contentUz || prev.content?.uz || '',
          ru: data.contentRu || prev.content?.ru || '',
        },
        seo: {
          title: {
            uz: data.seo.titleUz || prev.seo?.title?.uz || '',
            ru: data.seo.titleRu || prev.seo?.title?.ru || '',
          },
          description: {
            uz: data.seo.descriptionUz || prev.seo?.description?.uz || '',
            ru: data.seo.descriptionRu || prev.seo?.description?.ru || '',
          },
          keywords: {
            uz: (data.seo.keywordsUz || []).join(', '),
            ru: (data.seo.keywordsRu || []).join(', '),
          }
        }
      }));
    } catch (error) {
      console.error("AI Gen Error", error);
      showToast("AI xatolik yuz berdi. API kalitini tekshiring.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    const title = parseLocalizedObject(formData.title);
    const content = parseLocalizedObject(formData.content);
    const slug = parseLocalizedObject(formData.slug);
    const seoTitle = parseLocalizedObject(formData.seo?.title);
    const seoDescription = parseLocalizedObject(formData.seo?.description);
    const seoKeywords = parseLocalizedObject(formData.seo?.keywords);

    if (!title.uz.trim() || !content.uz.trim()) {
      showToast("Maqolaning o'zbekcha sarlavhasi va matni majburiy.", 'warning');
      return;
    }

    const localizedSlug = {
      uz: slug.uz.trim() || slugify(title.uz),
      ru: slug.ru.trim() || slugify(title.ru || title.uz),
    };

    const modernPayload: Record<string, any> = {
      title: JSON.stringify(title),
      slug: JSON.stringify(localizedSlug),
      image: formData.image,
      content: JSON.stringify(content),
      date: formData.date || new Date().toISOString().split('T')[0],
      seo: {
        title: JSON.stringify(seoTitle),
        description: JSON.stringify(seoDescription),
        keywords: JSON.stringify(seoKeywords),
      },
    };

    const withLegacySeo = (payload: Record<string, any>) => {
      const next = { ...payload };
      delete next.seo;
      next.seo_title = JSON.stringify(seoTitle);
      next.seo_description = JSON.stringify(seoDescription);
      next.seo_keywords = Object.values(seoKeywords).filter(Boolean);
      return next;
    };

    const getMissingColumn = (error: any) => {
      const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ');
      return message.match(/Could not find the '([^']+)' column/)?.[1] || '';
    };

    const normalizeSavedPost = (row: any): BlogPost => ({
      ...row,
      seo: row.seo || {
        title: row.seo_title || modernPayload.seo.title,
        description: row.seo_description || modernPayload.seo.description,
        keywords: row.seo_keywords || modernPayload.seo.keywords,
      },
    });

    try {
      setIsSaving(true);

      let payload = modernPayload;
      let savedRow: any = null;

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const query = formData.id
          ? supabase.from('blog_posts').update(payload).eq('id', formData.id).select().single()
          : supabase.from('blog_posts').insert([payload]).select().single();

        const { data, error } = await query;

        if (!error) {
          savedRow = data;
          break;
        }

        const missingColumn = getMissingColumn(error);
        if (missingColumn === 'seo') {
          payload = withLegacySeo(payload);
          continue;
        }
        if (missingColumn === 'slug') {
          const next = { ...payload };
          delete next.slug;
          payload = next;
          continue;
        }
        if (['seo_title', 'seo_description', 'seo_keywords'].includes(missingColumn)) {
          const next = { ...payload };
          delete next.seo_title;
          delete next.seo_description;
          delete next.seo_keywords;
          payload = next;
          continue;
        }

        throw error;
      }

      if (!savedRow) {
        throw new Error('Maqola saqlanmadi. Blog jadvali schema cache yoki ustunlarini tekshiring.');
      }

      const savedPost = normalizeSavedPost(savedRow);

      if (formData.id) {
        setPosts(prev => prev.map(p => p.id === savedPost.id ? savedPost : p));
      } else {
        setPosts(prev => [savedPost, ...prev]);
      }

      setIsModalOpen(false);
      showToast('Maqola saqlandi.', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Saqlashda xatolik: ' + (error as any).message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPosts = posts.filter(p =>
    (typeof p.title === 'string' ? p.title : JSON.stringify(p.title)).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-slate-50 p-4 md:p-8 min-h-screen text-slate-900">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Blog & Yangiliklar</h2>
          <p className="text-slate-500 font-medium">Saytning blog qismini boshqarish.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Yangi Maqola
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Maqola nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none font-medium shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:shadow-md transition-all flex flex-col shadow-sm">
            <div className="aspect-video relative overflow-hidden">
              <img src={post.image} alt={getLocalizedText(post.title, 'uz')} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur px-2 py-1 rounded text-xs text-white flex items-center gap-1 font-medium">
                <Calendar size={12} className="text-red-500" />
                {post.date}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{getLocalizedText(post.title, 'uz')}</h3>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1 font-medium">{getLocalizedText(post.content, 'uz')}</p>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-mono">ID: {post.id}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {formData.id ? 'Maqolani Tahrirlash' : 'Yangi Maqola'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm mb-5 font-medium">
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <span>Hozir <b>{activeLang.toUpperCase()}</b> tili uchun maqola kiritilyapti.</span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['uz', 'ru'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeLang === lang ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-slate-500 font-bold">Sarlavha ({activeLang.toUpperCase()})</label>
                <div className="flex gap-2">
                  <input
                    required={activeLang === 'uz'}
                    type="text"
                    value={formData.title?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none font-medium"
                    placeholder="Maqola mavzusi..."
                  />
                  <button
                    type="button"
                    onClick={generateContent}
                    disabled={isGenerating || !formData.title}
                    className="px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors font-bold border border-purple-250"
                  >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" /> : <Wand2 size={18} />}
                    <span className="hidden sm:inline">AI Yozish</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2 font-bold">
                  <Globe size={16} /> Slug ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={formData.slug?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, slug: { ...formData.slug, [activeLang]: e.target.value } })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none font-mono text-sm font-medium"
                  placeholder={activeLang === 'uz' ? 'qadoqlash-boyicha-maslahatlar' : 'sovety-po-upakovke'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2 font-bold">
                  <ImageIcon size={16} /> Rasm URL
                </label>
                <input
                  required
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none font-medium"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 font-bold">Matn (Content) ({activeLang.toUpperCase()})</label>
                <textarea
                  required={activeLang === 'uz'}
                  value={formData.content?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, content: { ...formData.content, [activeLang]: e.target.value } })}
                  className="w-full h-40 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none resize-none custom-scrollbar leading-relaxed font-medium"
                  placeholder="Maqola matni..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-500 font-bold">Sana</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-500 font-bold">SEO Title ({activeLang.toUpperCase()})</label>
                  <input
                    type="text"
                    value={formData.seo?.title?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, title: { ...formData.seo?.title, [activeLang]: e.target.value } } })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-colors font-bold">
                  Bekor qilish
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
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

export default AdminBlog;
