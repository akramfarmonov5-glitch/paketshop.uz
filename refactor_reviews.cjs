const fs = require('fs');
let code = fs.readFileSync('components/ProductReviews.tsx', 'utf8');

// Add imports
code = code.replace(
  `import { useToast } from '../context/ToastContext';`,
  `import { useToast } from '../context/ToastContext';\nimport { useLanguage } from '../context/LanguageContext';`
);

code = code.replace(
  `const { isDark } = useTheme();
  const { showToast } = useToast();`,
  `const { isDark } = useTheme();
  const { showToast } = useToast();
  const { t } = useLanguage();`
);

// "Mijozlar fikri"
code = code.replace(
  `Mijozlar fikri`,
  `{t('reviews_title')}`
);

// "izoh)"
code = code.replace(
  `{averageRating} ({reviews.length} izoh)`,
  `{averageRating} ({reviews.length} {t('reviews_count')})`
);

// "Fikr qoldirish" / "Bekor qilish"
code = code.replace(
  `{showForm ? 'Bekor qilish' : 'Fikr qoldirish'}`,
  `{showForm ? t('cancel') : t('leave_review')}`
);

// Form labels
code = code.replace(`Sizning Ismingiz`, `{t('your_name')}`);
code = code.replace(`Ismingizni kiriting`, `{t('enter_name_placeholder')}`);
code = code.replace(`Baholang`, `{t('rate')}`);
code = code.replace(`Izohingiz`, `{t('your_comment')}`);
code = code.replace(`Mahsulot haqida fikringiz...`, `{t('comment_placeholder')}`);

// Submit
code = code.replace(
  `{isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Yuborish</>}`,
  `{isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> {t('submit')}</>}`
);

// Empty state
code = code.replace(
  `Hali izohlar qoldirilmagan. Birinchi bo'lib fikr bildiring!`,
  `{t('no_reviews')}`
);

// Toast messages
code = code.replace(
  `showToast("Fikringiz uchun rahmat!", "success")`,
  `showToast(t('review_thanks'), "success")`
);
code = code.replace(
  `showToast("Xatolik yuz berdi.", "error")`,
  `showToast(t('error_occurred'), "error")`
);

fs.writeFileSync('components/ProductReviews.tsx', code);
console.log('ProductReviews fixed');
