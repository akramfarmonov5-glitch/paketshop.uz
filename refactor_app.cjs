const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Add getLocalizedText
code = code.replace(
  `import { productSlug, getIdFromSlug, blogSlug, getBlogIdFromSlug, slugify } from './lib/slugify';`,
  `import { productSlug, getIdFromSlug, blogSlug, getBlogIdFromSlug, slugify } from './lib/slugify';\nimport { getLocalizedText } from './lib/i18nUtils';`
);

// Fix Category slugify in routing
code = code.replace(
  `const cat = categories.find(c => slugify(c.name) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);`,
  `const cat = categories.find(c => slugify(getLocalizedText(c.name, 'uz')) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);`
);
code = code.replace(
  `const cat = categories.find(c => slugify(c.name) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);`,
  `const cat = categories.find(c => slugify(getLocalizedText(c.name, 'uz')) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);`
); // There are two usages in App.tsx

// Fix renderSEO
code = code.replace(
  `title={\`\${product.name} - \${product.category} sotib olish\`}`,
  `title={\`\${getLocalizedText(product.name, 'uz')} - \${getLocalizedText(product.category, 'uz')} sotib olish\`}`
);
code = code.replace(
  `description={\`\${product.name} - \${product.shortDescription}. Narxi: \${product.formattedPrice}. PaketShop.uz dan buyurtma bering. Bepul yetkazib berish!\`}`,
  `description={\`\${getLocalizedText(product.name, 'uz')} - \${getLocalizedText(product.shortDescription, 'uz')}. Narxi: \${product.formattedPrice}. PaketShop.uz dan buyurtma bering. Bepul yetkazib berish!\`}`
);
code = code.replace(
  `keywords={[product.name, product.category, 'sotib olish', 'narxi', 'PaketShop', 'online shop', 'uzbekistan']}`,
  `keywords={[getLocalizedText(product.name, 'uz'), getLocalizedText(product.category, 'uz'), 'sotib olish', 'narxi', 'PaketShop', 'online shop', 'uzbekistan']}`
);
code = code.replace(
  `{ name: product.category, url: \`\${BASE_URL}/category/\${slugify(product.category)}\` },`,
  `{ name: getLocalizedText(product.category, 'uz'), url: \`\${BASE_URL}/category/\${slugify(getLocalizedText(product.category, 'uz'))}\` },`
);
code = code.replace(
  `{ name: product.name, url: \`\${BASE_URL}/product/\${slug}\` }`,
  `{ name: getLocalizedText(product.name, 'uz'), url: \`\${BASE_URL}/product/\${slug}\` }`
);

code = code.replace(
  `title={\`\${cat.name} - Online Sotib Olish\`}`,
  `title={\`\${getLocalizedText(cat.name, 'uz')} - Online Sotib Olish\`}`
);
code = code.replace(
  `description={cat.description || \`\${cat.name} kategoriyasidagi sifatli mahsulotlar. PaketShop.uz dan buyurtma bering!\`}`,
  `description={getLocalizedText(cat.description, 'uz') || \`\${getLocalizedText(cat.name, 'uz')} kategoriyasidagi sifatli mahsulotlar. PaketShop.uz dan buyurtma bering!\`}`
);
code = code.replace(
  `keywords={[cat.name, 'sotib olish', 'narxi', 'PaketShop', 'uzbekistan']}`,
  `keywords={[getLocalizedText(cat.name, 'uz'), 'sotib olish', 'narxi', 'PaketShop', 'uzbekistan']}`
);
code = code.replace(
  `{ name: cat.name, url: \`\${BASE_URL}/category/\${cat.slug}\` }`,
  `{ name: getLocalizedText(cat.name, 'uz'), url: \`\${BASE_URL}/category/\${cat.slug}\` }`
);

fs.writeFileSync('App.tsx', code);
console.log('App.tsx refactored');
