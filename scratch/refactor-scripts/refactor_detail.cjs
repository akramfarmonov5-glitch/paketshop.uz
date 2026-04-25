const fs = require('fs');
let code = fs.readFileSync('components/ProductDetail.tsx', 'utf8');

// 1. Fix category badge (line ~190)
code = code.replace(
  `                {product.category}
              </span>
              <h1 className={\`text-2xl md:text-4xl lg:text-5xl font-bold leading-tight \${isDark ? 'bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400' : 'text-gray-900'}\`}>
                {product.name}`,
  `                {getLocalizedText(product.category, lang)}
              </span>
              <h1 className={\`text-2xl md:text-4xl lg:text-5xl font-bold leading-tight \${isDark ? 'bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400' : 'text-gray-900'}\`}>
                {getLocalizedText(product.name, lang)}`
);

// 2. Fix "Bitta bosishda xarid qilish" button
code = code.replace(
  `Bitta bosishda xarid qilish`,
  `{t('quick_buy')}`
);

// 3. Fix spec label and value
code = code.replace(
  `<p className={\`\${isDark ? 'text-gray-500' : 'text-gray-400'} text-[10px] md:text-xs uppercase tracking-wider mb-1\`}>{spec.label}</p>
                    <p className={\`\${isDark ? 'text-white' : 'text-gray-900'} text-xs md:text-sm font-medium\`}>{spec.value}</p>`,
  `<p className={\`\${isDark ? 'text-gray-500' : 'text-gray-400'} text-[10px] md:text-xs uppercase tracking-wider mb-1\`}>{getLocalizedText(spec.label, lang)}</p>
                    <p className={\`\${isDark ? 'text-white' : 'text-gray-900'} text-xs md:text-sm font-medium\`}>{getLocalizedText(spec.value, lang)}</p>`
);

fs.writeFileSync('components/ProductDetail.tsx', code);
console.log('ProductDetail fixed');
