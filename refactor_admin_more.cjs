const fs = require('fs');

// ============ FIX AdminCategories.tsx ============
let cat = fs.readFileSync('components/admin/AdminCategories.tsx', 'utf8');

// handleOpenAdd
cat = cat.replace(
  `  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      googleProductCategory: ''
    });
    setIsModalOpen(true);
  };`,
  `  const handleOpenAdd = () => {
    setFormData({
      name: { uz: '', ru: '', en: '' },
      slug: '',
      image: '',
      description: { uz: '', ru: '', en: '' },
      googleProductCategory: { uz: '', ru: '', en: '' }
    });
    setActiveLang('uz');
    setIsModalOpen(true);
  };`
);

// handleOpenEdit
cat = cat.replace(
  `  const handleOpenEdit = (category: Category) => {
    setFormData({
      ...category,
      description: category.description || '',
      googleProductCategory: category.googleProductCategory || ''
    });
    setIsModalOpen(true);
  };`,
  `  const handleOpenEdit = (category: Category) => {
    setFormData({
      ...category,
      name: parseLocalizedObject(category.name),
      description: parseLocalizedObject(category.description),
      googleProductCategory: parseLocalizedObject(category.googleProductCategory)
    });
    setActiveLang('uz');
    setIsModalOpen(true);
  };`
);

// Add language tabs to modal
cat = cat.replace(
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

// Inputs in AdminCategories
cat = cat.replace(
  `value={formData.name}`,
  `value={formData.name?.[activeLang] || ''}`
);
cat = cat.replace(
  `onChange={(e) => setFormData({ ...formData, name: e.target.value })}`,
  `onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } })}`
);
cat = cat.replace(
  `value={formData.description}`,
  `value={formData.description?.[activeLang] || ''}`
);
cat = cat.replace(
  `onChange={(e) => setFormData({ ...formData, description: e.target.value })}`,
  `onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}`
);
cat = cat.replace(
  `value={formData.googleProductCategory}`,
  `value={formData.googleProductCategory?.[activeLang] || ''}`
);
cat = cat.replace(
  `onChange={(e) => setFormData({ ...formData, googleProductCategory: e.target.value })}`,
  `onChange={(e) => setFormData({ ...formData, googleProductCategory: { ...formData.googleProductCategory, [activeLang]: e.target.value } })}`
);

// handleSave stringify
cat = cat.replace(
  `    const dataToSave: Record<string, any> = {
      name: formData.name,
      slug: formData.slug,
      image: formData.image,
      description: formData.description,
      googleProductCategory: formData.googleProductCategory
    };`,
  `    const dataToSave: Record<string, any> = {
      name: JSON.stringify(formData.name),
      slug: formData.slug,
      image: formData.image,
      description: JSON.stringify(formData.description),
      googleProductCategory: JSON.stringify(formData.googleProductCategory)
    };`
);

// Table fixes
cat = cat.replace(
  `<td className="p-4 font-bold text-white">{category.name}</td>`,
  `<td className="p-4 font-bold text-white">{getLocalizedText(category.name, 'uz')}</td>`
);
cat = cat.replace(
  `<td className="p-4 text-gray-400">{category.description || '-'}</td>`,
  `<td className="p-4 text-gray-400">{getLocalizedText(category.description, 'uz') || '-'}</td>`
);

fs.writeFileSync('components/admin/AdminCategories.tsx', cat);
console.log('AdminCategories fixed');


// ============ FIX AdminBlog.tsx ============
let blog = fs.readFileSync('components/admin/AdminBlog.tsx', 'utf8');

// Table fix [object Object]
blog = blog.replace(
  `<h4 className="font-bold text-white mb-1">{post.title}</h4>`,
  `<h4 className="font-bold text-white mb-1">{getLocalizedText(post.title, 'uz')}</h4>`
);
blog = blog.replace(
  `<p className="text-sm text-gray-400 line-clamp-2">{post.content}</p>`,
  `<p className="text-sm text-gray-400 line-clamp-2">{getLocalizedText(post.content, 'uz')}</p>`
);

// Add language tabs if missing
if (!blog.includes('bg-gold-400 text-black')) {
  blog = blog.replace(
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
}

// Inputs
blog = blog.replace(
  /value=\{formData\.title\}/g,
  `value={formData.title?.[activeLang] || ''}`
);
blog = blog.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, title: e\.target\.value \}\)\}/g,
  `onChange={e => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}`
);
blog = blog.replace(
  /value=\{formData\.content\}/g,
  `value={formData.content?.[activeLang] || ''}`
);
blog = blog.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, content: e\.target\.value \}\)\}/g,
  `onChange={e => setFormData({ ...formData, content: { ...formData.content, [activeLang]: e.target.value } })}`
);

// SEO inputs
blog = blog.replace(
  /value=\{formData\.seo\?\.title\}/g,
  `value={formData.seo?.title?.[activeLang] || ''}`
);
blog = blog.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, seo: \{ \.\.\.formData\.seo, title: e\.target\.value \} \}\)\}/g,
  `onChange={e => setFormData({ ...formData, seo: { ...formData.seo, title: { ...formData.seo?.title, [activeLang]: e.target.value } } })}`
);

blog = blog.replace(
  /value=\{formData\.seo\?\.description\}/g,
  `value={formData.seo?.description?.[activeLang] || ''}`
);
blog = blog.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, seo: \{ \.\.\.formData\.seo, description: e\.target\.value \} \}\)\}/g,
  `onChange={e => setFormData({ ...formData, seo: { ...formData.seo, description: { ...formData.seo?.description, [activeLang]: e.target.value } } })}`
);

blog = blog.replace(
  /value=\{\(formData\.seo\?\.keywords \|\| \[\]\)\.join\(\', \'\)\}/g,
  `value={(formData.seo?.keywords?.[activeLang] || []).join(', ')}`
);
blog = blog.replace(
  /onChange=\{e => setFormData\(\{ \.\.\.formData, seo: \{ \.\.\.formData\.seo, keywords: e\.target\.value\.split\(\',\('\)\.map\(k => k\.trim\(\)\) \} \}\)\}/g,
  `onChange={e => setFormData({ ...formData, seo: { ...formData.seo, keywords: { ...formData.seo?.keywords, [activeLang]: e.target.value.split(',').map(k => k.trim()) } } })}`
);

// handleSave in AdminBlog
blog = blog.replace(
  `    const dataToSave = {
      title: formData.title,
      image: formData.image,
      content: formData.content,
      seo: formData.seo,
      date: formData.date
    };`,
  `    const dataToSave = {
      title: JSON.stringify(formData.title),
      image: formData.image,
      content: JSON.stringify(formData.content),
      seo: {
        title: JSON.stringify(formData.seo?.title),
        description: JSON.stringify(formData.seo?.description),
        keywords: JSON.stringify(formData.seo?.keywords)
      },
      date: formData.date
    };`
);

// handleOpenAdd in AdminBlog
blog = blog.replace(
  `  const handleOpenAdd = () => {
    setFormData({
      title: '',
      image: '',
      content: '',
      seo: { title: '', description: '', keywords: [] },
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };`,
  `  const handleOpenAdd = () => {
    setFormData({
      title: { uz: '', ru: '', en: '' },
      image: '',
      content: { uz: '', ru: '', en: '' },
      seo: { title: { uz: '', ru: '', en: '' }, description: { uz: '', ru: '', en: '' }, keywords: { uz: [], ru: [], en: [] } },
      date: new Date().toISOString().split('T')[0]
    });
    setActiveLang('uz');
    setIsModalOpen(true);
  };`
);

fs.writeFileSync('components/admin/AdminBlog.tsx', blog);
console.log('AdminBlog fixed');
