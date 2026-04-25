const fs = require('fs');
let code = fs.readFileSync('components/Checkout.tsx', 'utf8');

code = code.replace(
  `import { useLanguage } from '../context/LanguageContext';`,
  `import { useLanguage } from '../context/LanguageContext';\nimport { getLocalizedText } from '../lib/i18nUtils';`
);

code = code.replace(
  `const { t } = useLanguage();`,
  `const { lang, t } = useLanguage();`
);

code = code.replace(
  `items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),`,
  `items: cart.map((item) => ({
          id: item.id,
          name: getLocalizedText(item.name, lang),
          quantity: item.quantity,
          price: item.price,
        })),`
);

code = code.replace(
  `const itemsList = cart.map((item, index) =>
      \`\${index + 1}. \${item.name} (x\${item.quantity}) - \${new Intl.NumberFormat('uz-UZ').format(item.price * item.quantity)} UZS\`
    ).join('\\n');`,
  `const itemsList = cart.map((item, index) =>
      \`\${index + 1}. \${getLocalizedText(item.name, lang)} (x\${item.quantity}) - \${new Intl.NumberFormat('uz-UZ').format(item.price * item.quantity)} UZS\`
    ).join('\\n');`
);

code = code.replace(
  `<h4 className={\`text-sm font-medium \${isDark ? 'text-white' : 'text-light-text'}\`}>{item.name}</h4>
                    <p className={\`text-xs \${isDark ? 'text-gray-400' : 'text-light-muted'}\`}>{item.category}</p>`,
  `<h4 className={\`text-sm font-medium \${isDark ? 'text-white' : 'text-light-text'}\`}>{getLocalizedText(item.name, lang)}</h4>
                    <p className={\`text-xs \${isDark ? 'text-gray-400' : 'text-light-muted'}\`}>{getLocalizedText(item.category, lang)}</p>`
);

code = code.replace(
  `<img src={item.image} alt={item.name} className="w-full h-full object-cover" />`,
  `<img src={item.image} alt={getLocalizedText(item.name, lang)} className="w-full h-full object-cover" />`
);

fs.writeFileSync('components/Checkout.tsx', code);
console.log('Checkout refactored successfully');
