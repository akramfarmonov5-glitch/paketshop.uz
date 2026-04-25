const fs = require('fs');
let code = fs.readFileSync('components/admin/AdminProducts.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  `import { requestGeminiJson } from '../../lib/geminiApi';`,
  `import { requestGeminiJson } from '../../lib/geminiApi';\nimport { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';`
);
code = code.replace(
  `import { Edit, Trash2, Plus, Search, X, Save, Image as ImageIcon, Sparkles, Loader2, ArrowUpRight } from 'lucide-react';`,
  `import { Edit, Trash2, Plus, Search, X, Save, Image as ImageIcon, Sparkles, Loader2, ArrowUpRight, Globe } from 'lucide-react';`
);

// 2. Add activeLang state and modify formData initialization
code = code.replace(
  `const [formData, setFormData] = useState<Partial<Product>>({`,
  `const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');\n  const [formData, setFormData] = useState<any>({`
);

code = code.replace(
  `    setFormData({
      name: '',
      price: 0,
      formattedPrice: '',
      category: categories.length > 0 ? categories[0].name : '',
      image: '',
      images: [],
      shortDescription: '',
      specs: [{ label: '', value: '' }]
    });`,
  `    setFormData({
      name: {uz:'', ru:'', en:''},
      price: 0,
      formattedPrice: '',
      category: categories.length > 0 ? (typeof categories[0].name === 'string' ? categories[0].name : JSON.stringify(categories[0].name)) : '',
      image: '',
      images: [],
      shortDescription: {uz:'', ru:'', en:''},
      specs: [{ label: {uz:'', ru:'', en:''}, value: {uz:'', ru:'', en:''} }]
    });`
);

code = code.replace(
  `    setFormData({
      ...product,
      images: product.images || [],
      specs: product.specs || [{ label: '', value: '' }]
    });`,
  `    setFormData({
      ...product,
      name: parseLocalizedObject(product.name),
      shortDescription: parseLocalizedObject(product.shortDescription),
      specs: (product.specs || [{ label: '', value: '' }]).map(s => ({
         label: parseLocalizedObject(s.label),
         value: parseLocalizedObject(s.value)
      })),
      images: product.images || []
    });`
);

// 3. Save modifications
code = code.replace(
  `    const dataToSave = {
      name: formData.name,
      price: formData.price,
      formattedPrice: formData.formattedPrice,
      category: formData.category,
      image: formData.image || 'https://via.placeholder.com/400',
      images: formData.images || [],
      shortDescription: formData.shortDescription || '',
      specs: formData.specs?.filter(s => s.label && s.value) || [],
      videoUrl: formData.videoUrl || null
    };`,
  `    const dataToSave = {
      name: JSON.stringify(formData.name),
      price: formData.price,
      formattedPrice: formData.formattedPrice,
      category: formData.category,
      image: formData.image || 'https://via.placeholder.com/400',
      images: formData.images || [],
      shortDescription: JSON.stringify(formData.shortDescription),
      specs: formData.specs?.filter(s => s.label?.uz && s.value?.uz).map(s => ({
         label: JSON.stringify(s.label),
         value: JSON.stringify(s.value)
      })) || [],
      videoUrl: formData.videoUrl || null
    };`
);

// 4. Modal Header
code = code.replace(
  `              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\\'shish'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>`,
  `              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\\'shish'}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex bg-black p-1 rounded-xl border border-white/10">
                    {(['uz', 'ru', 'en'] as const).map(l => (
                        <button
                            key={l}
                            type="button"
                            onClick={() => setActiveLang(l)}
                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all \${activeLang === l ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'}\`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>`
);

// 5. Add Language Note in Form
code = code.replace(
  `<form onSubmit={handleSave} className="space-y-6">`,
  `<form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-2 mb-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                  <Globe size={18} />
                  <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
              </div>`
);

// 6. Form fields localization
code = code.replace(
  `value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}`,
  `value={formData.name?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } })}`
);

code = code.replace(
  `{categories.map(cat => (
                      <option className="bg-zinc-900 text-white" key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}`,
  `{categories.map(cat => (
                      <option className="bg-zinc-900 text-white" key={cat.id} value={typeof cat.name === 'string' ? cat.name : JSON.stringify(cat.name)}>{getLocalizedText(cat.name, activeLang)}</option>
                    ))}`
);

code = code.replace(
  `value={formData.shortDescription || ''}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}`,
  `value={formData.shortDescription?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, [activeLang]: e.target.value } })}`
);

code = code.replace(
  `value={spec.label}
                        onChange={e => handleSpecChange(index, 'label', e.target.value)}`,
  `value={spec.label?.[activeLang] || ''}
                        onChange={e => handleSpecChange(index, 'label', { ...spec.label, [activeLang]: e.target.value })}`
);

code = code.replace(
  `value={spec.value}
                        onChange={e => handleSpecChange(index, 'value', e.target.value)}`,
  `value={spec.value?.[activeLang] || ''}
                        onChange={e => handleSpecChange(index, 'value', { ...spec.value, [activeLang]: e.target.value })}`
);

// Fix list rendering
code = code.replace(
  `p.name.toLowerCase().includes(searchTerm.toLowerCase())`,
  `(typeof p.name === 'string' ? p.name : JSON.stringify(p.name)).toLowerCase().includes(searchTerm.toLowerCase())`
);

code = code.replace(
  `p.category.toLowerCase().includes(searchTerm.toLowerCase())`,
  `(typeof p.category === 'string' ? p.category : JSON.stringify(p.category)).toLowerCase().includes(searchTerm.toLowerCase())`
);

code = code.replace(
  `<h3 className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors line-clamp-1">{product.name}</h3>`,
  `<h3 className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors line-clamp-1">{getLocalizedText(product.name, 'uz')}</h3>`
);

code = code.replace(
  `{product.category}`,
  `{getLocalizedText(product.category, 'uz')}`
);

fs.writeFileSync('components/admin/AdminProducts.tsx', code);
console.log('AdminProducts.tsx refactored');
