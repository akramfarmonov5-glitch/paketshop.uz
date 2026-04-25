const fs = require('fs');
let code = fs.readFileSync('components/SEOHead.tsx', 'utf8');

code = code.replace(
  `import { Product, BlogPost, Category } from '../types';`,
  `import { Product, BlogPost, Category } from '../types';\nimport { useLanguage } from '../context/LanguageContext';\nimport { getLocalizedText } from '../lib/i18nUtils';`
);

code = code.replace(
  `  noindex = false,
}) => {
  useEffect(() => {`,
  `  noindex = false,
}) => {
  const { lang } = useLanguage();
  useEffect(() => {`
);

code = code.replace(
  `"name": product.name,
        "image": [product.image, ...(product.images || [])],
        "description": product.shortDescription,`,
  `"name": getLocalizedText(product.name, lang),
        "image": [product.image, ...(product.images || [])],
        "description": getLocalizedText(product.shortDescription, lang),`
);

code = code.replace(
  `"category": product.category,`,
  `"category": getLocalizedText(product.category, lang),`
);

code = code.replace(
  `"headline": blogPost.title,`,
  `"headline": getLocalizedText(blogPost.title, lang),`
);

code = code.replace(
  `"description": blogPost.seo?.description || blogPost.content.substring(0, 160),`,
  `"description": getLocalizedText(blogPost.seo?.description, lang) || getLocalizedText(blogPost.content, lang).substring(0, 160),`
);

code = code.replace(
  `"name": \`\${category.name} - PaketShop.uz\`,
        "description": category.description || \`\${category.name} kategoriyasi\`,`,
  `"name": \`\${getLocalizedText(category.name, lang)} - PaketShop.uz\`,
        "description": getLocalizedText(category.description, lang) || \`\${getLocalizedText(category.name, lang)} kategoriyasi\`,`
);

fs.writeFileSync('components/SEOHead.tsx', code);
console.log('SEOHead.tsx refactored');
