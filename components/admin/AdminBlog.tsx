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
                <div className="flex gap-2">
                  <input
                    required={activeLang === 'uz'}
                    type="text"
                    value={formData.title?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none"
                    placeholder="Maqola mavzusi..."
                  />
                  <button
                    type="button"
                    onClick={generateContent}
                    disabled={isGenerating || !formData.title}
                    className="px-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isGenerating ? <div className="w-4 h-4 border-2 border-current rounded-full animate-spin" /> : <Wand2 size={18} />}
                    <span className="hidden sm:inline">AI Yozish</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2">
                  <Globe size={16} /> Slug ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={formData.slug?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, slug: { ...formData.slug, [activeLang]: e.target.value } })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none font-mono text-sm"
                  placeholder={activeLang === 'uz' ? 'qadoqlash-boyicha-maslahatlar' : activeLang === 'ru' ? 'sovety-po-upakovke' : 'packaging-tips'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 flex items-center gap-2">
                  <ImageIcon size={16} /> Rasm URL
                </label>
                <input
                  required
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500">Matn (Content) ({activeLang.toUpperCase()})</label>
                <textarea
                  required={activeLang === 'uz'}
                  value={formData.content?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, content: { ...formData.content, [activeLang]: e.target.value } })}
                  className="w-full h-40 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none resize-none custom-scrollbar leading-relaxed"
                  placeholder="Maqola matni..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-500">Sana</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-500">SEO Title ({activeLang.toUpperCase()})</label>
                  <input
                    type="text"
                    value={formData.seo?.title?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, title: { ...formData.seo?.title, [activeLang]: e.target.value } } })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={18} />}
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
