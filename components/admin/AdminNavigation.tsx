import React, { useState } from 'react';
import { NavigationSettings, MenuItem, SocialLink, Category } from '../../types';
import { Plus, Trash2, Menu, Share2, Save, GripVertical, Link as LinkIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AdminNavigationProps {
    navigationSettings: NavigationSettings;
    setNavigationSettings: React.Dispatch<React.SetStateAction<NavigationSettings>>;
    categories: Category[];
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ navigationSettings, setNavigationSettings, categories }) => {
    const [formData, setFormData] = useState<NavigationSettings>({ ...navigationSettings });
    const [isSaved, setIsSaved] = useState(false);

    // Menu Handlers
    const addMenuItem = () => {
        setFormData(prev => ({
            ...prev,
            menuItems: [...prev.menuItems, { id: Date.now(), label: '', href: '#' }]
        }));
    };

    const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
        const newItems = [...formData.menuItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, menuItems: newItems }));
    };

    const removeMenuItem = (index: number) => {
        const newItems = [...formData.menuItems];
        newItems.splice(index, 1);
        setFormData(prev => ({ ...prev, menuItems: newItems }));
    };

    // Social Handlers
    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { id: Date.now(), platform: 'instagram', url: '' }]
        }));
    };

    const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        const newItems = [...formData.socialLinks];
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, socialLinks: newItems }));
    };

    const removeSocialLink = (index: number) => {
        const newItems = [...formData.socialLinks];
        newItems.splice(index, 1);
        setFormData(prev => ({ ...prev, socialLinks: newItems }));
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);

        try {
            // Upsert navigation settings to Supabase
            const { error } = await supabase
                .from('navigation_settings')
                .upsert({ id: 'main', ...formData }, { onConflict: 'id' });

            if (error) throw error;

            setNavigationSettings(formData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Save error:', error);
            alert('Saqlashda xatolik: ' + (error as any).message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Navigatsiya Sozlamalari</h2>
                <p className="text-gray-400">Mobil menyu va ijtimoiy tarmoq havolalarini boshqarish.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Menu Items Section */}
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Menu size={20} className="text-gold-400" />
                            Menyu Qatorlari
                        </h3>
                        <button
                            onClick={addMenuItem}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gold-400 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.menuItems.map((item, index) => (
                            <div key={item.id} className="flex gap-2 items-start bg-black/40 p-3 rounded-xl border border-white/5">
                                <GripVertical size={16} className="text-gray-600 cursor-grab mt-3" />
                                <div className="flex-1 space-y-2">
                                    {/* Label */}
                                    <input
                                        type="text"
                                        placeholder="Nomi (Masalan: Erkaklar)"
                                        value={item.label}
                                        onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                                        className="w-full bg-transparent border-b border-white/10 text-sm text-white focus:outline-none focus:border-gold-400 pb-1"
                                    />

                                    {/* Link Input & Selector */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <LinkIcon size={12} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="URL (Masalan: #)"
                                                value={item.href}
                                                onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                                                className="w-full bg-transparent border-none text-xs text-gray-500 focus:text-gold-400 focus:outline-none pl-4"
                                            />
                                        </div>

                                        <select
                                            className="bg-zinc-800 text-xs text-gray-300 rounded px-2 py-1 outline-none border border-white/10 hover:border-gold-400 focus:border-gold-400 max-w-[120px]"
                                            onChange={(e) => {
                                                if (e.target.value) updateMenuItem(index, 'href', e.target.value);
                                            }}
                                            value=""
                                        >
                                            <option value="" disabled>Tanlash...</option>
                                            <optgroup label="Sahifalar">
                                                <option value="#"># (Bo'sh)</option>
                                                <option value="/">Bosh sahifa</option>
                                            </optgroup>
                                            <optgroup label="Kategoriyalar">
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={`#category-${cat.name}`}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => removeMenuItem(index)} className="text-gray-500 hover:text-red-400 p-2 mt-1">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {formData.menuItems.length === 0 && (
                            <p className="text-center text-gray-600 text-sm py-4">Menyu bo'sh.</p>
                        )}
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Share2 size={20} className="text-gold-400" />
                            Ijtimoiy Tarmoqlar
                        </h3>
                        <button
                            onClick={addSocialLink}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gold-400 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.socialLinks.map((item, index) => (
                            <div key={item.id} className="flex gap-2 items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                <select
                                    value={item.platform}
                                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                                    className="bg-zinc-800 text-white text-xs rounded px-2 py-1 outline-none border border-white/10 focus:border-gold-400"
                                >
                                    <option className="bg-zinc-900 text-white" value="instagram">Instagram</option>
                                    <option className="bg-zinc-900 text-white" value="telegram">Telegram</option>
                                    <option className="bg-zinc-900 text-white" value="facebook">Facebook</option>
                                    <option className="bg-zinc-900 text-white" value="youtube">YouTube</option>
                                    <option className="bg-zinc-900 text-white" value="twitter">Twitter</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="URL (https://...)"
                                    value={item.url}
                                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                    className="flex-1 bg-transparent border-b border-white/10 text-sm text-blue-400 focus:outline-none focus:border-gold-400 pb-1"
                                />
                                <button onClick={() => removeSocialLink(index)} className="text-gray-500 hover:text-red-400 p-2">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {formData.socialLinks.length === 0 && (
                            <p className="text-center text-gray-600 text-sm py-4">Havolalar yo'q.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Action */}
            <div className="fixed bottom-6 right-6 md:right-10 z-30">
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-2xl transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-gold-400 text-black hover:bg-gold-500 hover:scale-105'
                        }`}
                >
                    {isSaved ? 'Saqlandi!' : (
                        <>
                            <Save size={20} /> O'zgarishlarni Saqlash
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminNavigation;