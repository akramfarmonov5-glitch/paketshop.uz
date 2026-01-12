import React from 'react';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogPostDetailProps {
  post: BlogPost;
  onBack: () => void;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ post, onBack }) => {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-black text-white">
      <article className="container mx-auto px-4 md:px-6 max-w-4xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Ortga qaytish</span>
        </button>

        <div className="mb-8">
           <span className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-3 block">Blog</span>
           <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">{post.title}</h1>
           
           <div className="flex items-center gap-6 text-sm text-gray-400 border-b border-white/10 pb-8">
              <div className="flex items-center gap-2">
                 <Calendar size={16} />
                 <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                 <User size={16} />
                 <span>PaketShop Admin</span>
              </div>
           </div>
        </div>

        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-10 bg-zinc-900 border border-white/10">
           <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
           <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
        
        {/* Share / Footer of post */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
            <p className="text-gray-500 italic">O'qiganingiz uchun rahmat.</p>
            <button className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors">
                <Share2 size={18} />
                <span className="font-medium">Ulashish</span>
            </button>
        </div>
      </article>
    </div>
  );
};

export default BlogPostDetail;
