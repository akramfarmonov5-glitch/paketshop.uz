import React from 'react';
import { BlogPost } from '../types';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface BlogGridProps {
  posts: BlogPost[];
  onPostClick: (id: string) => void;
}

const BlogGrid: React.FC<BlogGridProps> = ({ posts, onPostClick }) => {
  const { isDark } = useTheme();
  // Faqat oxirgi 6 ta postni ko'rsatamiz
  const displayPosts = posts.slice(0, 6);

  if (displayPosts.length === 0) return null;

  return (
    <section className={`py-20 border-t transition-colors duration-300 ${isDark ? 'bg-dark-900 border-white/5' : 'bg-light-card border-light-border'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="space-y-2">
            <span className="text-gold-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> Blog & Yangiliklar
            </span>
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>
              Moda Olamidan <span className={isDark ? 'text-gray-500' : 'text-light-muted'}>Xabarlar</span>
            </h2>
          </div>
          <button className={`hidden md:flex items-center gap-2 hover:text-gold-400 transition-colors text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>
            Barcha maqolalar <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onPostClick(post.id)}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center gap-1.5 border border-white/10">
                  <Calendar size={12} className="text-gold-400" />
                  {post.date}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className={`text-xl font-bold mb-3 group-hover:text-gold-400 transition-colors line-clamp-2 ${isDark ? 'text-white' : 'text-light-text'}`}>
                  {post.title}
                </h3>
                <p className={`text-sm line-clamp-3 mb-4 flex-1 ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                  {post.content}
                </p>
                <span className={`inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all ${isDark ? 'text-white' : 'text-light-text'}`}>
                  O'qish <ArrowRight size={16} className="text-gold-400" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        <button className={`md:hidden mt-10 w-full py-4 border rounded-xl flex items-center justify-center gap-2 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-light-border text-light-text hover:bg-light-card'}`}>
          Barcha maqolalar <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default BlogGrid;