import React, { useState } from 'react';
import { HeroContent } from '../../types';
import { Save, Image as ImageIcon, Type, MousePointerClick, PlusCircle, MinusCircle, Loader2, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import CloudinaryUpload from '../CloudinaryUpload';
import { parseLocalizedObject, LocalizedString } from '../../lib/i18nUtils';

interface AdminHeroProps {
    heroContent: HeroContent;
    setHeroContent: React.Dispatch<React.SetStateAction<HeroContent>>;
}

const AdminHero: React.FC<AdminHeroProps> = ({ heroContent, setHeroContent }) => {
    const { showToast } = useToast();
    // Ensure text fields are fully localized objects
    const [formData, setFormData] = useState<any>({
        ...heroContent,
        badge: parseLocalizedObject(heroContent.badge),
        title: parseLocalizedObject(heroContent.title),
        description: parseLocalizedObject(heroContent.description),
        buttonText: parseLocalizedObject(heroContent.buttonText),
        images: heroContent.images || []
    });
    const [activeLang, setActiveLang] = useState<'uz' | 'ru' | 'en'>('uz');
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Prepare data for save (stringify objects)
            const savePayload = {
                id: 2, // Explicitly use integer ID for hero_content
                badge: JSON.stringify(formData.badge),
                title: JSON.stringify(formData.title),
                description: JSON.stringify(formData.description),
                button_text: JSON.stringify(formData.buttonText),
                images: formData.images
            };

            // Upsert to Supabase
            const { error } = await supabase
                .from('hero_content')
                .update(savePayload)
                .eq('id', 2);

            if (error) throw error;

            setHeroContent(formData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Save error:', error);
            showToast('Saqlashda xatolik: ' + (error as any).message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const addImage = () => {
        if (formData.images.length < 5) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const updateImage = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    // Safe access to first image for preview
    const previewImage = formData.images.length > 0 ? formData.images[0] : '';

    return (
        <div className="max-w-4xl">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Banner Sozlamalari (Hero)</h2>
                    <p className="text-gray-400">Veb-saytning bosh sahifasidagi asosiy bannerni o'zgartirish.</p>
                </div>
                <div className="flex bg-black p-1 rounded-xl border border-white/10">
                    {(['uz', 'ru', 'en'] as const).map(l => (
                        <button
                            key={l}
                            onClick={() => setActiveLang(l)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeLang === l ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6 bg-zinc-900 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                        <Globe size={18} />
                        <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                            <Type size={16} /> Nishon (Badge)
                        </label>
                        <input
                            type="text"
                            value={formData.badge[activeLang]}
                            onChange={(e) => setFormData({ ...formData, badge: { ...formData.badge, [activeLang]: e.target.value } })}
                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                            placeholder="Masalan: Yangi Xizmat"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                            <Type size={16} /> Sarlavha (Title)
                        </label>
                        <input
                            type="text"
                            value={formData.title[activeLang]}
                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                            placeholder="Masalan: Sizning ishonchli hamkoringiz"
                        />
                        <p className="text-[10px] text-gray-500">Sarlavha ikkiga bo'linib ko'rsatiladi (Oq va Gradient).</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Tavsif (Description)</label>
                        <textarea
                            value={formData.description[activeLang]}
                            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 focus:outline-none min-h-[100px] resize-y"
                            placeholder="Masalan: Biz sizning biznesingiz uchun tez va ishonchli yetkazib berish xizmatlarini taqdim etamiz..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                            <MousePointerClick size={16} /> Tugma Matni
                        </label>
                        <input
                            type="text"
                            value={formData.buttonText[activeLang]}
                            onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, [activeLang]: e.target.value } })}
                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:border-gold-400 focus:outline-none"
                            placeholder="Masalan: Hozir buyurtma berish"
                        />
                    </div>

                    {/* Images Array */}
                    <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm text-gray-400 flex items-center gap-2">
                                <ImageIcon size={16} /> Rasmlar (Slayd-shou)
                            </label>
                            <button type="button" onClick={addImage} className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
                                <PlusCircle size={14} /> Qo'shish
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.images.map((url, index) => (
                                <div key={index} className="relative bg-black rounded-xl p-3 border border-white/10">
                                    <CloudinaryUpload 
                                        currentImage={url}
                                        label={`Slayd ${index + 1}`}
                                        onUpload={(newUrl) => updateImage(index, newUrl)}
                                    />
                                    {formData.images.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(index)} 
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-xs z-10 transition-colors"
                                        >
                                            <MinusCircle size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500 text-white' : 'bg-gold-400 text-black hover:bg-gold-500'}`}
                    >
                        {isSaved ? (
                            <>Saqlandi!</>
                        ) : (
                            <>
                                <Save size={18} /> Saqlash
                            </>
                        )}
                    </button>
                </form>

                {/* Live Preview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Jonli Ko'rinish (Birinchi rasm)</h3>
                    <div className="bg-black border border-white/10 rounded-3xl overflow-hidden relative aspect-[3/4] lg:aspect-square">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-gray-500">Rasm yo'q</div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                            <span className="inline-block px-2 py-1 bg-gold-500/20 text-gold-400 text-[10px] font-bold uppercase rounded border border-gold-500/30">
                                {formData.badge?.[activeLang] || ''}
                            </span>
                            <h2 className="text-2xl font-bold text-white leading-tight">
                                {formData.title?.[activeLang] || ''}
                            </h2>
                            <p className="text-sm text-gray-300 line-clamp-3">
                                {formData.description}
                            </p>
                            <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full mt-2">
                                {formData.buttonText?.[activeLang] || ''}
                            </button>
                        </div>

                        {formData.images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white border border-white/10">
                                +{formData.images.length - 1} slides
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHero;