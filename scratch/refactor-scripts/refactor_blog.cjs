const fs = require('fs');
let code = fs.readFileSync('components/admin/AdminBlog.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  `import { requestGeminiJson } from '../../lib/geminiApi';`,
  `import { requestGeminiJson } from '../../lib/geminiApi';\nimport { parseLocalizedObject, getLocalizedText } from '../../lib/i18nUtils';\nimport { Globe } from 'lucide-react';`
);

// 2. Add activeLang state and modify formData initialization
code = code.replace(
  `const [isGenerating, setIsGenerating] = useState(false);`,
  `const [isGenerating, setIsGenerating] = useState(false);\n  const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');`
);

code = code.replace(
  `    setFormData({
      title: '',
      image: '',
      content: '',
      seo: { title: '', description: '', keywords: [] },
      date: new Date().toISOString().split('T')[0]
    });`,
  `    setFormData({
      title: {uz:'', ru:'', en:''},
      image: '',
      content: {uz:'', ru:'', en:''},
      seo: { title: {uz:'', ru:'', en:''}, description: {uz:'', ru:'', en:''}, keywords: {uz:'', ru:'', en:''} },
      date: new Date().toISOString().split('T')[0]
    });`
);

code = code.replace(
  `    setFormData({
      ...post,
      seo: post.seo || { title: '', description: '', keywords: [] },
    });`,
  `    setFormData({
      ...post,
      title: parseLocalizedObject(post.title),
      content: parseLocalizedObject(post.content),
      seo: {
         title: parseLocalizedObject(post.seo?.title),
         description: parseLocalizedObject(post.seo?.description),
         keywords: parseLocalizedObject(post.seo?.keywords)
      }
    });`
);

// 3. Save modifications
code = code.replace(
  `    const postData = { ...formData };`,
  `    const postData: any = { 
       ...formData,
       title: JSON.stringify(formData.title),
       content: JSON.stringify(formData.content),
       seo: {
           title: JSON.stringify(formData.seo?.title),
           description: JSON.stringify(formData.seo?.description),
           keywords: JSON.stringify(formData.seo?.keywords)
       }
    };`
);

// 4. Modal Header
code = code.replace(
  `              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Maqolani Tahrirlash' : 'Yangi Maqola Qo\\'shish'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>`,
  `              <h3 className="text-xl font-bold text-white">
                {formData.id ? 'Maqolani Tahrirlash' : 'Yangi Maqola Qo\\'shish'}
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
  `value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}`,
  `value={formData.title?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}`
);

code = code.replace(
  `value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}`,
  `value={formData.content?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, content: { ...formData.content, [activeLang]: e.target.value } })}`
);

code = code.replace(
  `value={formData.seo?.title || ''}
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, title: e.target.value } })}`,
  `value={formData.seo?.title?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, title: { ...formData.seo!.title, [activeLang]: e.target.value } } })}`
);

code = code.replace(
  `value={formData.seo?.description || ''}
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, description: e.target.value } })}`,
  `value={formData.seo?.description?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, description: { ...formData.seo!.description, [activeLang]: e.target.value } } })}`
);

code = code.replace(
  `value={formData.seo?.keywords?.join(', ') || ''}
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, keywords: e.target.value.split(',').map(k => k.trim()) } })}`,
  `value={formData.seo?.keywords?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo!, keywords: { ...formData.seo!.keywords, [activeLang]: e.target.value } } })}`
);


// Fix list rendering
code = code.replace(
  `p.title.toLowerCase().includes(searchTerm.toLowerCase())`,
  `(typeof p.title === 'string' ? p.title : JSON.stringify(p.title)).toLowerCase().includes(searchTerm.toLowerCase())`
);

code = code.replace(
  `<h3 className="font-bold text-white text-lg group-hover:text-gold-400 transition-colors line-clamp-1">{post.title}</h3>`,
  `<h3 className="font-bold text-white text-lg group-hover:text-gold-400 transition-colors line-clamp-1">{getLocalizedText(post.title, 'uz')}</h3>`
);

// Fix AI prompt
code = code.replace(
  `Topic: "\${formData.title}"`,
  `Topic: "\${formData.title?.uz || formData.title}"`
);
code = code.replace(
  `if (!formData.title) {`,
  `if (!formData.title || (!formData.title.uz && typeof formData.title !== 'string')) {`
);

code = code.replace(
  `setFormData(prev => ({
        ...prev,
        content: data.content,
        seo: data.seo
      }));`,
  `setFormData(prev => ({
        ...prev,
        content: { ...prev.content, [activeLang]: data.content },
        seo: {
          title: { ...prev.seo?.title, [activeLang]: data.seo.title },
          description: { ...prev.seo?.description, [activeLang]: data.seo.description },
          keywords: { ...prev.seo?.keywords, [activeLang]: data.seo.keywords.join(', ') }
        }
      }));`
);


fs.writeFileSync('components/admin/AdminBlog.tsx', code);
console.log('AdminBlog refactored');
