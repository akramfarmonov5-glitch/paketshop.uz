const fs = require('fs');

let prod = fs.readFileSync('components/admin/AdminProducts.tsx', 'utf8');

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

// Fix name input
prod = prod.replace(
  `                  <label className="text-sm text-gray-400">Nomi</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}`,
  `                  <label className="text-sm text-gray-400">Nomi ({activeLang.toUpperCase()})</label>
                  <input
                    required={activeLang === 'uz'}
                    type="text"
                    value={formData.name?.[activeLang] || ''}
                    onChange={e => setFormData({ ...formData, name: { ...formData.name, [activeLang]: e.target.value } })}`
);

// Fix description input
prod = prod.replace(
  `                <textarea
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}`,
  `                <textarea
                  value={formData.shortDescription?.[activeLang] || ''}
                  onChange={e => setFormData({ ...formData, shortDescription: { ...formData.shortDescription, [activeLang]: e.target.value } })}`
);

// Fix specs inputs
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
                        onChange={(e) => updateSpec(index, 'value', e.target.value)}`,
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
                        }}`
);

fs.writeFileSync('components/admin/AdminProducts.tsx', prod);
console.log('AdminProducts tabs added successfully');
