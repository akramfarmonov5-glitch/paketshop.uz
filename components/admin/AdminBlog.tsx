import React, { useState } from 'react';
import { BlogPost } from '../../types';
import { Sparkles, Image as ImageIcon, Plus, Trash2, Calendar, Wand2, Search, Edit, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { requestGeminiJson } from '../../lib/geminiApi';

interface AdminBlogProps {
  posts: BlogPost[];
  setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const AdminBlog: React.FC<AdminBlogProps> = ({ posts, setPosts }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    image: '',
    content: '',
    seo: { title: '', description: '', keywords: [] },
    date: ''
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
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
      seo: post.seo || { title: '', description: '', keywords: [] },
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
    if (!formData.title) {
      showToast("Iltimos, avval maqola mavzusi (Title)ni yozing.", 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const data = await requestGeminiJson<{
        content: string;
        seo: {
          title: string;
          description: string;
          keywords: string[];
        };
      }>({
        systemInstruction: 'You are an expert content writer for a packaging materials and wholesale store in Uzbekistan. Always answer in valid JSON.',
        message: `
          Topic: "${formData.title}"

          Generate a blog post in Uzbek language:
          1. content: informative content about packaging, business, or wholesale (around 150 words)
          2. seo.title: short catchy title
          3. seo.description: meta description
          4. seo.keywords: array of 5 related strings

          Return JSON:
          {
            "content": "...",
            "seo": {
              "title": "...",
              "description": "...",
              "keywords": ["...", "..."]
            }
          }
        `,
      });

      setFormData(prev => ({
        ...prev,
        content: data.content,
        seo: data.seo
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

    const postData = { ...formData };

    try {
      if (postData.id) {
        // Update existing
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postData.id);
        if (error) throw error;
        setPosts(prev => prev.map(p => p.id === postData.id ? (postData as BlogPost) : p));
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select();
        if (error) throw error;
        if (data && data.length > 0) {
          setPosts(prev => [(data[0] as BlogPost), ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      showToast('Saqlashda xatolik: ' + (error as any).message, 'error');
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Blog & Yangiliklar</h2>
          <p className="text-gray-400">Saytning blog qismini boshqarish.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gold-400 text-black font-bold rounded-xl hover:bg-gold-500 transition-colors"
        >
          <Plus size={18} />
          Yangi Maqola
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Maqola nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-gold-400/50 transition-all flex flex-col">
            <div className="aspect-video relative overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                <Calendar size={12} className="text-gold-400" />
                {post.date}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{post.content}</p>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">ID: {post.id}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Maqolani Tahrirlash' : 'Yangi Maqola'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Sarlavha</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="flex-1 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
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
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <ImageIcon size={16} /> Rasm URL
                </label>
                <input
                  required
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Matn (Content)</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-40 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none resize-none custom-scrollbar leading-relaxed"
                  placeholder="Maqola matni..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Sana</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seo?.title || ''}
                    onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, title: e.target.value } })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-gold-400 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
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

export default AdminBlog;
