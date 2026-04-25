const fs = require('fs');

// ============ FIX AdminProducts.tsx ============
let prod = fs.readFileSync('components/admin/AdminProducts.tsx', 'utf8');

// 1. Add Globe import
prod = prod.replace(
  `import { Edit, Trash2, Plus, Search, Check, X, Save, PlusCircle, MinusCircle, Image as ImageIcon, Youtube, Wand2, Sparkles, Box } from 'lucide-react';`,
  `import { Edit, Trash2, Plus, Search, Check, X, Save, PlusCircle, MinusCircle, Image as ImageIcon, Youtube, Wand2, Sparkles, Box, Globe } from 'lucide-react';`
);

// 2. Fix handleOpenAdd - use localized objects
prod = prod.replace(
  `    setFormData({
      name: '',
      category: categories.length > 0 ? categories[0].name : '',
      price: 0,
      image: '',
      images: [''],
      videoUrl: '',
      shortDescription: '',
      stock: 0,
      itemsPerPackage: 1,
      specs: [{ label: '', value: '' }]
    });`,
  `    setFormData({
      name: { uz: '', ru: '', en: '' },
      category: categories.length > 0 ? categories[0].name : '',
      price: 0,
      image: '',
      images: [''],
      videoUrl: '',
      shortDescription: { uz: '', ru: '', en: '' },
      stock: 0,
      itemsPerPackage: 1,
      specs: [{ label: { uz: '', ru: '', en: '' }, value: { uz: '', ru: '', en: '' } }]
    });
    setActiveLang('uz');`
);

// 3. Fix handleOpenEdit - parse localized fields
prod = prod.replace(
  `    setFormData({
      ...product,
      images: images
    });
    setIsModalOpen(true);`,
  `    setFormData({
      ...product,
      name: parseLocalizedObject(product.name),
      shortDescription: parseLocalizedObject(product.shortDescription),
      specs: (product.specs || []).map(s => ({
        label: parseLocalizedObject(s.label),
        value: parseLocalizedObject(s.value)
      })),
      images: images
    });
    setActiveLang('uz');
    setIsModalOpen(true);`
);

// 4. Fix handleSave - stringify localized fields
prod = prod.replace(
  `    const dataToSave: Record<string, any> = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      image: mainImage,
      images: validImages,
      description: formData.shortDescription,
      stock: Number(formData.stock),
      "itemsPerPackage": Number(formData.itemsPerPackage || 1),
      specifications: formData.specs
    };`,
  `    const dataToSave: Record<string, any> = {
      name: JSON.stringify(formData.name),
      category: formData.category,
      price: Number(formData.price),
      image: mainImage,
      images: validImages,
      description: JSON.stringify(formData.shortDescription),
      stock: Number(formData.stock),
      "itemsPerPackage": Number(formData.itemsPerPackage || 1),
      specifications: (formData.specs || []).map(s => ({
        label: JSON.stringify(s.label),
        value: JSON.stringify(s.value)
      }))
    };`
);

// 5. Fix product name display in table
prod = prod.replace(
  `<td className="p-4 font-medium text-white">{product.name}</td>`,
  `<td className="p-4 font-medium text-white">{getLocalizedText(product.name, 'uz')}</td>`
);

// Fix product image alt  
prod = prod.replace(
  `<img src={product.image} alt={product.name} className="w-full h-full object-cover" />`,
  `<img src={product.image} alt={getLocalizedText(product.name, 'uz')} className="w-full h-full object-cover" />`
);

// 6. Add language tabs after modal header close button
prod = prod.replace(
  `              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">`,
  `              <div className="flex items-center gap-3">
                <div className="flex bg-black p-1 rounded-xl border border-white/10">
                  {(['uz', 'ru', 'en'] as const).map(l => (
                    <button key={l} type="button" onClick={() => setActiveLang(l)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all \${activeLang === l ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'}\`}
                    >{l}</button>
                  ))}
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                <Globe size={18} />
                <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
              </div>`
);

// 7. Fix name input to use localized value
prod = prod.replace(
  `                  <label className="text-sm text-gray-400">Nomi</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                    placeholder="Masalan: Rolex Submariner"
                  />`,
  `                  <label className="text-sm text-gray-400">Nomi ({activeLang.toUpperCase()})</label>
                  <input
                    required={activeLang === 'uz'}
                    type="text"
                    value={formData.name?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } })}
                    className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none"
                    placeholder="Masalan: Rolex Submariner"
                  />`
);

// 8. Fix shortDescription input
prod = prod.replace(
  `                <textarea
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full h-24 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none resize-none"
                  placeholder="Tavsif yozing yoki 'AI To'ldirish' tugmasini bosing..."
                />`,
  `                <textarea
                  value={formData.shortDescription?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, [activeLang]: e.target.value } })}
                  className="w-full h-24 bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 outline-none resize-none"
                  placeholder="Tavsif yozing yoki 'AI To'ldirish' tugmasini bosing..."
                />`
);

// 9. Fix spec label/value inputs
prod = prod.replace(
  `                      <input
                        type="text"
                        placeholder="Nomi"
                        value={spec.label}
                        onChange={(e) => updateSpec(index, 'label', e.target.value)}
                        className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Qiymati"
                        value={spec.value}
                        onChange={(e) => updateSpec(index, 'value', e.target.value)}
                        className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />`,
  `                      <input
                        type="text"
                        placeholder="Nomi"
                        value={spec.label?.[activeLang] || ''}
                        onChange={(e) => {
                          const newSpecs = [...(formData.specs || [])];
                          newSpecs[index] = { ...newSpecs[index], label: { ...newSpecs[index].label, [activeLang]: e.target.value } };
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                        className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Qiymati"
                        value={spec.value?.[activeLang] || ''}
                        onChange={(e) => {
                          const newSpecs = [...(formData.specs || [])];
                          newSpecs[index] = { ...newSpecs[index], value: { ...newSpecs[index].value, [activeLang]: e.target.value } };
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                        className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
                      />`
);

// 10. Fix AI generation to write to activeLang
prod = prod.replace(
  `      setFormData(prev => ({
        ...prev,
        shortDescription: data.shortDescription,
        specs: data.specs
      }));`,
  `      setFormData(prev => ({
        ...prev,
        shortDescription: { ...prev.shortDescription, [activeLang]: data.shortDescription },
        specs: data.specs.map((s, i) => ({
          label: { ...(prev.specs?.[i]?.label || {}), [activeLang]: s.label },
          value: { ...(prev.specs?.[i]?.value || {}), [activeLang]: s.value }
        }))
      }));`
);

// 11. Fix AI prompt to use localized name
prod = prod.replace(
  `Product name: "\${formData.name}"`,
  `Product name: "\${formData.name?.uz || formData.name}"`
);

fs.writeFileSync('components/admin/AdminProducts.tsx', prod);
console.log('AdminProducts.tsx fixed with language tabs');

// ============ FIX AdminHero.tsx ============
let hero = fs.readFileSync('components/admin/AdminHero.tsx', 'utf8');

// Fix: hero content text fields rendered as React children
// The issue is that formData.badge/title/description/buttonText are objects, not strings
// The preview section or any place that renders them directly needs to use activeLang
// Look for any direct rendering of formData fields
// The main issue is likely in input value bindings - let's check if they use activeLang correctly
// Since AdminHero already has activeLang and parseLocalizedObject, let's find the input fields

// Fix input values to use activeLang
hero = hero.replace(
  /value=\{formData\.badge\}/g,
  `value={formData.badge?.[activeLang] || ''}`
);
hero = hero.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, badge: e\.target\.value \}\)\}/g,
  `onChange={e => setFormData({ ...formData, badge: { ...formData.badge, [activeLang]: e.target.value } })}`
);

hero = hero.replace(
  /value=\{formData\.title\}/g,
  `value={formData.title?.[activeLang] || ''}`
);
hero = hero.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, title: e\.target\.value \}\)\}/g,
  `onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}`
);

hero = hero.replace(
  /value=\{formData\.description\}/g,
  `value={formData.description?.[activeLang] || ''}`
);
hero = hero.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, description: e\.target\.value \}\)\}/g,
  `onChange={e => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}`
);

hero = hero.replace(
  /value=\{formData\.buttonText\}/g,
  `value={formData.buttonText?.[activeLang] || ''}`
);
hero = hero.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, buttonText: e\.target\.value \}\)\}/g,
  `onChange={e => setFormData({ ...formData, buttonText: { ...formData.buttonText, [activeLang]: e.target.value } })}`
);

// Fix setHeroContent - it might try to render objects as children  
// The parent component renders heroContent.badge etc. directly
// Let's also fix the preview section if it exists
hero = hero.replace(
  /\{formData\.badge\}/g,
  `{formData.badge?.[activeLang] || ''}`
);
hero = hero.replace(
  /\{formData\.title\}/g,
  `{formData.title?.[activeLang] || ''}`
);
hero = hero.replace(
  /\{formData\.buttonText\}/g,
  `{formData.buttonText?.[activeLang] || ''}`
);

fs.writeFileSync('components/admin/AdminHero.tsx', hero);
console.log('AdminHero.tsx fixed');

// ============ FIX Hero.tsx (storefront) ============
let heroFront = fs.readFileSync('components/Hero.tsx', 'utf8');

// Check if Hero.tsx renders heroContent fields directly
if (heroFront.includes('{heroContent.badge}')) {
  heroFront = heroFront.replace(
    /\{heroContent\.badge\}/g,
    `{getLocalizedText(heroContent.badge, lang)}`
  );
  heroFront = heroFront.replace(
    /\{heroContent\.title\}/g,
    `{getLocalizedText(heroContent.title, lang)}`
  );
  heroFront = heroFront.replace(
    /\{heroContent\.description\}/g,
    `{getLocalizedText(heroContent.description, lang)}`
  );
  heroFront = heroFront.replace(
    /\{heroContent\.buttonText\}/g,
    `{getLocalizedText(heroContent.buttonText, lang)}`
  );
  
  // Add imports if needed
  if (!heroFront.includes('getLocalizedText')) {
    heroFront = heroFront.replace(
      `import { useLanguage } from '../context/LanguageContext';`,
      `import { useLanguage } from '../context/LanguageContext';\nimport { getLocalizedText } from '../lib/i18nUtils';`
    );
  }
  if (!heroFront.includes('useLanguage')) {
    heroFront = heroFront.replace(
      `import { useTheme } from '../context/ThemeContext';`,
      `import { useTheme } from '../context/ThemeContext';\nimport { useLanguage } from '../context/LanguageContext';\nimport { getLocalizedText } from '../lib/i18nUtils';`
    );
  }
  
  // Add lang variable if not present
  if (!heroFront.includes('const { lang')) {
    if (heroFront.includes('const { isDark }')) {
      heroFront = heroFront.replace(
        `const { isDark } = useTheme();`,
        `const { isDark } = useTheme();\n  const { lang } = useLanguage();`
      );
    }
  }
  
  fs.writeFileSync('components/Hero.tsx', heroFront);
  console.log('Hero.tsx fixed');
} else {
  console.log('Hero.tsx - no direct heroContent rendering found, skipping');
}

console.log('All admin fixes complete!');
