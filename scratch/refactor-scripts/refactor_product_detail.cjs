const fs = require('fs');
let code = fs.readFileSync('components/ProductDetail.tsx', 'utf8');

code = code.replace(
  `import { requestGeminiText } from '../lib/geminiApi';`,
  `import { requestGeminiText } from '../lib/geminiApi';\nimport { getLocalizedText } from '../lib/i18nUtils';`
);

// Breadcrumbs
code = code.replace(
  `{ label: product.category, onClick: onBack },
              { label: product.name, active: true }`,
  `{ label: getLocalizedText(product.category, lang), onClick: onBack },
              { label: getLocalizedText(product.name, lang), active: true }`
);

// Alt attributes
code = code.replace(
  `alt={product.name}`,
  `alt={getLocalizedText(product.name, lang)}`
);

// Product Category and Name
code = code.replace(
  `{product.category}
              </span>
              <h1 className={\`text-2xl md:text-4xl lg:text-5xl font-bold leading-tight \${isDark ? 'bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400' : 'text-gray-900'}\`}>
                {product.name}
              </h1>`,
  `{getLocalizedText(product.category, lang)}
              </span>
              <h1 className={\`text-2xl md:text-4xl lg:text-5xl font-bold leading-tight \${isDark ? 'bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400' : 'text-gray-900'}\`}>
                {getLocalizedText(product.name, lang)}
              </h1>`
);

// Specs
code = code.replace(
  `{product.specs.map((spec, index) => (
                  <div key={index}>
                    <p className={\`\${isDark ? 'text-gray-500' : 'text-gray-400'} text-[10px] md:text-xs uppercase tracking-wider mb-1\`}>{spec.label}</p>
                    <p className={\`\${isDark ? 'text-white' : 'text-gray-900'} text-xs md:text-sm font-medium\`}>{spec.value}</p>
                  </div>
                ))}`,
  `{product.specs.map((spec, index) => (
                  <div key={index}>
                    <p className={\`\${isDark ? 'text-gray-500' : 'text-gray-400'} text-[10px] md:text-xs uppercase tracking-wider mb-1\`}>{getLocalizedText(spec.label, lang)}</p>
                    <p className={\`\${isDark ? 'text-white' : 'text-gray-900'} text-xs md:text-sm font-medium\`}>{getLocalizedText(spec.value, lang)}</p>
                  </div>
                ))}`
);

// AI Prompt Fixes
code = code.replace(
  `" in the "\${product.category}" category.`,
  `" in the "\${getLocalizedText(product.category, 'uz')}" category.`
);

code = code.replace(
  `item named "\${product.name}"`,
  `item named "\${getLocalizedText(product.name, 'uz')}"`
);


fs.writeFileSync('components/ProductDetail.tsx', code);
console.log('ProductDetail.tsx refactored');
