import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, User, MessageCircle, Send, Loader2 } from 'lucide-react';
import { hasSupabaseCredentials, supabase } from '../lib/supabaseClient';
import { Review } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MOCK fallback for when DB isn't configured yet
  const FAKE_REVIEWS: Review[] = [
    {
      id: 'fake-1',
      product_id: productId,
      user_name: 'Jasur Bek',
      rating: 5,
      comment: 'Kutganimdan ham a\'lo sifat! Rahmat sizlarga, tavsiya qilaman.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'fake-2',
      product_id: productId,
      user_name: 'Dildora',
      rating: 4,
      comment: 'Juda chiroyli dizayn, lekin yetkazib berish bir oz kechikdi.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    }
  ];

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (!hasSupabaseCredentials) {
        setReviews(FAKE_REVIEWS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet
        console.warn("Could not fetch reviews:", error);
        setReviews(FAKE_REVIEWS);
      } else if (data && data.length > 0) {
        setReviews(data as Review[]);
      } else {
        // If empty, show some fake ones to keep the design alive initially (optional)
        setReviews([]);
      }
    } catch (e) {
      console.error(e);
      setReviews(FAKE_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);

    const newReview = {
      product_id: productId,
      user_name: name,
      rating,
      comment,
    };

    try {
      if (hasSupabaseCredentials) {
        const { error } = await supabase.from('product_reviews').insert(newReview);
        if (error) {
          console.error("Error saving review:", error);
        }
      }

      // Optimistically add to UI
      const mockInsertedReview: Review = {
        ...newReview,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      setReviews([mockInsertedReview, ...reviews]);
      showToast("Fikringiz uchun rahmat!", "success");
      
      setName('');
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (error) {
      showToast("Xatolik yuz berdi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (count: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < Math.round(count) ? 'text-gold-400' : 'text-gray-400 opacity-30'} 
        fill={i < Math.round(count) ? 'currentColor' : 'none'}
      />
    ));
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`py-8 flex justify-center items-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className={`mt-10 px-4 md:px-0`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl md:text-2xl font-bold mb-1 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <MessageCircle size={22} className="text-gold-400" />
            Mijozlar fikri
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(Number(averageRating))}</div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {averageRating} ({reviews.length} izoh)
              </span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors border ${isDark ? 'border-gold-400/30 text-gold-400 hover:bg-gold-400/10' : 'border-black text-black hover:bg-black hover:text-white'}`}
        >
          {showForm ? 'Bekor qilish' : 'Fikr qoldirish'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className={`mb-8 p-5 md:p-6 rounded-2xl border ${isDark ? 'bg-dark-800 border-white/10' : 'bg-gray-50 border-gray-200'}`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sizning Ismingiz</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-gold-400 transition-colors ${isDark ? 'bg-dark-900 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    placeholder="Ismingizni kiriting"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Baholang</label>
                  <div className="flex gap-1 h-[46px] items-center px-4 rounded-xl border bg-transparent">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none cursor-pointer p-0.5"
                      >
                        <Star 
                          size={24} 
                          className={`transition-colors ${(hoveredRating || rating) >= star ? 'text-gold-400' : 'text-gray-400 opacity-40'}`} 
                          fill={(hoveredRating || rating) >= star ? 'currentColor' : 'none'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Izohingiz</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-gold-400 transition-colors resize-none ${isDark ? 'bg-dark-900 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  placeholder="Mahsulot haqida fikringiz..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold-400 text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gold-500 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Yuborish</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length === 0 ? (
          <div className={`text-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Hali izohlar qoldirilmagan. Birinchi bo'lib fikr bildiring!
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={review.id} 
              className={`p-4 md:p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex border items-center justify-center rounded-full ${isDark ? 'bg-dark-900 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{review.user_name}</h4>
                    <span className={`text-[10px] md:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex border rounded-full px-2 py-1 bg-gold-400/10 border-gold-400/20">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {review.comment}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
