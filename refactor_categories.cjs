const fs = require('fs');
let code = fs.readFileSync('components/admin/AdminCategories.tsx', 'utf8');

code = code.replace(
  `import { requestGeminiJson } from '../../lib/geminiApi';`,
  `import { requestGeminiJson } from '../../lib/geminiApi';\nimport { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';`
);

code = code.replace(
  `const [formData, setFormData] = useState<Partial<Category>>({`,
  `const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');\n  const [formData, setFormData] = useState<any>({`
);

code = code.replace(
  `    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      googleProductCategory: ''
    });`,
  `    setFormData({
      name: {uz:'', ru:'', en:''},
      slug: '',
      image: '',
      description: {uz:'', ru:'', en:''},
      googleProductCategory: ''
    });`
);

code = code.replace(
  `    setFormData({
      ...category,
      description: category.description || '',
      googleProductCategory: category.googleProductCategory || ''
    });`,
  `    setFormData({
      ...category,
      name: parseLocalizedObject(category.name),
      description: parseLocalizedObject(category.description),
      googleProductCategory: category.googleProductCategory || ''
    });`
);

code = code.replace(
  `    const slug = formData.slug || formData.name?.toLowerCase().replace(/\\s+/g, '-') || '';

    const dataToSave = {
      name: formData.name,
      slug,
      image: formData.image || 'https://via.placeholder.com/400',
      description: formData.description || '',
      googleProductCategory: formData.googleProductCategory || '',
    };`,
  `    const uzName = formData.name?.uz || '';
    const slug = formData.slug || uzName.toLowerCase().replace(/\\s+/g, '-') || '';

    const dataToSave = {
      name: JSON.stringify(formData.name),
      slug,
      image: formData.image || 'https://via.placeholder.com/400',
      description: JSON.stringify(formData.description),
      googleProductCategory: formData.googleProductCategory || '',
    };`
);

code = code.replace(
  `              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>`,
  `              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
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

code = code.replace(
  `<form onSubmit={handleSave} className="space-y-5">`,
  `<form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-2 mb-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                  <Globe size={18} />
                  <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
              </div>`
);

code = code.replace(
  `value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}`,
  `value={formData.name[activeLang]}
                    onChange={e => setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } })}`
);

code = code.replace(
  `value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}`,
  `value={formData.description[activeLang]}
                  onChange={e => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}`
);

code = code.replace(
  `disabled={isGenerating || !formData.name}`,
  `disabled={isGenerating || !formData.name?.uz}`
);

code = code.replace(
  `>{category.name}</h3>`,
  `>{getLocalizedText(category.name, 'uz')}</h3>`
);

code = code.replace(
  `>{category.description || "Tavsif yo'q"}</p>`,
  `>{getLocalizedText(category.description, 'uz') || "Tavsif yo'q"}</p>`
);

fs.writeFileSync('components/admin/AdminCategories.tsx', code);
console.log('Done replacing AdminCategories.tsx');
