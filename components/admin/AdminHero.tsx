import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { HeroContent } from '../../types';
import { Save, Image as ImageIcon, Type, MousePointerClick, PlusCircle, MinusCircle, Loader2, Globe } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import CloudinaryUpload from '../CloudinaryUpload';
import { parseLocalizedObject, LocalizedString } from '../../lib/i18nUtils';

interface HeroFormData {
    badge: LocalizedString;
    title: LocalizedString;
    description: LocalizedString;
    buttonText: LocalizedString;
    images: string[];
}

interface AdminHeroProps {
    heroContent: HeroContent;
    setHeroContent: React.Dispatch<React.SetStateAction<HeroContent>>;
}

const normalizeImages = (images: unknown): string[] => Array.isArray(images)
    ? images.filter((image): image is string => typeof image === 'string')
    : [];

const toFormData = (heroContent: HeroContent): HeroFormData => ({
    badge: parseLocalizedObject(heroContent.badge),
    title: parseLocalizedObject(heroContent.title),
    description: parseLocalizedObject(heroContent.description),
    buttonText: parseLocalizedObject(heroContent.buttonText),
    images: normalizeImages(heroContent.images),
});

const AdminHero: React.FC<AdminHeroProps> = ({ heroContent, setHeroContent }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<HeroFormData>(() => toFormData(heroContent));
    const [activeLang, setActiveLang] = useState<'uz' | 'ru'>('uz');
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let isActive = true;
        const loadHero = async () => {
            try {
                const response = await fetch('/api/admin/content/hero', {
                    signal: controller.signal,
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error || 'Banner yuklanmadi');
                if (!isActive) return;
                const loadedHero = result.heroContent as HeroContent;
                setFormData(toFormData(loadedHero));
                setHeroContent(loadedHero);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                console.error('Banner load error:', error);
                if (isActive) showToast('Banner ma’lumotlarini yuklab bo‘lmadi', 'error');
            } finally {
                if (isActive) setIsLoading(false);
            }
        };
        void loadHero();
        return () => {
            isActive = false;
            controller.abort();
        };
    }, [setHeroContent, showToast]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const savePayload = {
                ...formData,
                images: formData.images.filter(Boolean),
            };

            const response = await fetch('/api/admin/content/hero', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Banner saqlanmadi');

            const savedHero = (result.heroContent || savePayload) as HeroContent;
            setFormData(toFormData(savedHero));
            setHeroContent(savedHero);
            setIsSaved(true);
            showToast('Banner saqlandi', 'success');
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Save error:', error);
            showToast('Saqlashda xatolik: ' + (error instanceof Error ? error.message : 'Noma’lum xatolik'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const addImage = () => {
        if (normalizeImages(formData.images).length < 5) {
            setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...normalizeImages(formData.images)];
        newImages.splice(index, 1);
        setFormData((prev) => ({ ...prev, images: newImages }));
    };

    const updateImage = (index: number, value: string) => {
        const newImages = [...normalizeImages(formData.images)];
        newImages[index] = value;
        setFormData((prev) => ({ ...prev, images: newImages }));
    };

    // Safe access to first image for preview
    const images = normalizeImages(formData.images);
    const previewImage = images.length > 0 ? images[0] : '';

    return (
        <div className="max-w-4xl">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Banner Sozlamalari (Hero)</h2>
                    <p className="text-slate-500">Veb-saytning bosh sahifasidagi asosiy bannerni o'zgartirish.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    {(['uz', 'ru'] as const).map(l => (
                        <button
                            key={l}
                            onClick={() => setActiveLang(l)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeLang === l ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6 bg-white border border-slate-200 p-6 rounded-2xl">
                    {isLoading && (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                            <Loader2 size={16} className="animate-spin" />
                            Banner ma’lumotlari yuklanmoqda...
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
                        <Globe size={18} />
                        <span>Siz hozir <b>{activeLang.toUpperCase()}</b> tili uchun ma'lumot kiritmoqdasiz.</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-500 flex items-center gap-2">
                            <Type size={16} /> Nishon (Badge)
                        </label>
                        <input
                            type="text"
                            value={formData.badge[activeLang] || ''}
                            onChange={(e) => setFormData({ ...formData, badge: { ...formData.badge, [activeLang]: e.target.value } })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none"
                            placeholder="Masalan: Yangi Xizmat"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-500 flex items-center gap-2">
                            <Type size={16} /> Sarlavha (Title)
                        </label>
                        <input
                            type="text"
                            value={formData.title[activeLang] || ''}
                            onChange={(e) => setFormData({ ...formData, title: { ...formData.title, [activeLang]: e.target.value } })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none"
                            placeholder="Masalan: Sizning ishonchli hamkoringiz"
                        />
                        <p className="text-[10px] text-slate-400">Sarlavha ikkiga bo'linib ko'rsatiladi (Oq va Gradient).</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-500">Tavsif (Description)</label>
                        <textarea
                            value={formData.description[activeLang] || ''}
                            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [activeLang]: e.target.value } })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none min-h-[100px] resize-y"
                            placeholder="Masalan: Biz sizning biznesingiz uchun tez va ishonchli yetkazib berish xizmatlarini taqdim etamiz..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-500 flex items-center gap-2">
                            <MousePointerClick size={16} /> Tugma Matni
                        </label>
                        <input
                            type="text"
                            value={formData.buttonText[activeLang] || ''}
                            onChange={(e) => setFormData({ ...formData, buttonText: { ...formData.buttonText, [activeLang]: e.target.value } })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-red-600 focus:outline-none"
                            placeholder="Masalan: Hozir buyurtma berish"
                        />
                    </div>

                    {/* Images Array */}
                    <div className="space-y-3 bg-white/40 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-500 flex items-center gap-2">
                                <ImageIcon size={16} /> Rasmlar (Slayd-shou)
                            </label>
                            <button type="button" onClick={addImage} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                                <PlusCircle size={14} /> Qo'shish
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {images.map((url, index) => (
                                <div key={index} className="relative bg-white rounded-xl p-3 border border-slate-200">
                                    <CloudinaryUpload 
                                        currentImage={url}
                                        label={`Slayd ${index + 1}`}
                                        onUpload={(newUrl) => updateImage(index, newUrl)}
                                    />
                                    {images.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(index)} 
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-slate-900 rounded-lg text-xs z-10 transition-colors"
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
                        disabled={isSaving || isLoading}
                        className={`w-full py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500 text-slate-900' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                        {isSaving ? (
                            <><Loader2 size={18} className="animate-spin" /> Saqlanmoqda...</>
                        ) : isSaved ? (
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
                    <h3 className="text-lg font-bold text-slate-900">Jonli Ko'rinish (Birinchi rasm)</h3>
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden relative aspect-[4/5]">
                        {previewImage ? (
                            <Image
                                src={previewImage}
                                alt="Preview"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-slate-400">Rasm yo'q</div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                            <span className="inline-block px-2 py-1 bg-gold-500/20 text-red-600 text-[10px] font-bold uppercase rounded border border-gold-500/30">
                                {formData.badge?.[activeLang] || ''}
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                {formData.title?.[activeLang] || ''}
                            </h2>
                            <p className="text-sm text-slate-600 line-clamp-3">
                                {formData.description?.[activeLang] || ''}
                            </p>
                            <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full mt-2">
                                {formData.buttonText?.[activeLang] || ''}
                            </button>
                        </div>

                        {images.length > 1 && (
                            <div className="absolute top-4 right-4 bg-white/50 backdrop-blur px-2 py-1 rounded text-xs text-slate-900 border border-slate-200">
                                +{images.length - 1} slides
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHero;
