import React, { useEffect, useState } from 'react';
import {
    GripVertical,
    Link as LinkIcon,
    Loader2,
    Menu,
    Plus,
    Save,
    Share2,
    Trash2,
} from 'lucide-react';
import type {
    LocalizedString,
    NavigationSettings,
    SocialLink,
} from '../../types';
import { getLocalizedText, parseLocalizedObject } from '../../lib/i18nUtils';
import { useToast } from '../../context/ToastContext';

interface AdminNavigationProps {
    navigationSettings: NavigationSettings;
    setNavigationSettings: React.Dispatch<React.SetStateAction<NavigationSettings>>;
}

interface NavigationCategory {
    id: string;
    name: LocalizedString;
    slug: LocalizedString;
}

const toEditableSettings = (settings: NavigationSettings): NavigationSettings => ({
    menuItems: settings.menuItems.map((item) => ({
        ...item,
        label: parseLocalizedObject(item.label),
    })),
    socialLinks: settings.socialLinks.map((item) => ({ ...item })),
});

const AdminNavigation: React.FC<AdminNavigationProps> = ({
    navigationSettings,
    setNavigationSettings,
}) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<NavigationSettings>(
        () => toEditableSettings(navigationSettings),
    );
    const [categories, setCategories] = useState<NavigationCategory[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let isActive = true;
        const loadNavigation = async () => {
            try {
                const response = await fetch('/api/admin/content/navigation', {
                    signal: controller.signal,
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(result.error || 'Navigatsiya yuklanmadi');
                }
                if (!isActive) return;
                const loadedSettings = result.navigationSettings as NavigationSettings;
                setFormData(toEditableSettings(loadedSettings));
                setNavigationSettings(loadedSettings);
                setCategories((result.categories || []) as NavigationCategory[]);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                console.error('Navigation load error:', error);
                if (isActive) showToast('Navigatsiya ma’lumotlarini yuklab bo‘lmadi', 'error');
            } finally {
                if (isActive) setIsLoading(false);
            }
        };
        void loadNavigation();
        return () => {
            isActive = false;
            controller.abort();
        };
    }, [setNavigationSettings, showToast]);

    const addMenuItem = () => {
        setFormData((previous) => ({
            ...previous,
            menuItems: [
                ...previous.menuItems,
                {
                    id: crypto.randomUUID(),
                    label: { uz: '', ru: '' },
                    href: '#',
                },
            ],
        }));
    };

    const updateMenuLabel = (
        index: number,
        lang: keyof LocalizedString,
        value: string,
    ) => {
        setFormData((previous) => ({
            ...previous,
            menuItems: previous.menuItems.map((item, itemIndex) => (
                itemIndex === index
                    ? {
                        ...item,
                        label: {
                            ...parseLocalizedObject(item.label),
                            [lang]: value,
                        },
                    }
                    : item
            )),
        }));
    };

    const updateMenuHref = (
        index: number,
        href: string | LocalizedString,
    ) => {
        setFormData((previous) => ({
            ...previous,
            menuItems: previous.menuItems.map((item, itemIndex) => (
                itemIndex === index ? { ...item, href } : item
            )),
        }));
    };

    const chooseCategory = (index: number, categoryId: string) => {
        const category = categories.find((item) => item.id === categoryId);
        if (!category) return;
        updateMenuHref(index, {
            uz: `/category/${category.slug.uz}`,
            ru: `/category/${category.slug.ru}`,
        });
    };

    const removeMenuItem = (index: number) => {
        setFormData((previous) => ({
            ...previous,
            menuItems: previous.menuItems.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const addSocialLink = () => {
        setFormData((previous) => ({
            ...previous,
            socialLinks: [
                ...previous.socialLinks,
                {
                    id: crypto.randomUUID(),
                    platform: 'instagram',
                    url: '',
                },
            ],
        }));
    };

    const updateSocialLink = (
        index: number,
        field: 'platform' | 'url',
        value: string,
    ) => {
        setFormData((previous) => ({
            ...previous,
            socialLinks: previous.socialLinks.map((item, itemIndex) => (
                itemIndex === index
                    ? { ...item, [field]: value } as SocialLink
                    : item
            )),
        }));
    };

    const removeSocialLink = (index: number) => {
        setFormData((previous) => ({
            ...previous,
            socialLinks: previous.socialLinks.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/content/navigation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || 'Navigatsiya saqlanmadi');

            const savedSettings = (result.navigationSettings || formData) as NavigationSettings;
            setFormData(toEditableSettings(savedSettings));
            setNavigationSettings(savedSettings);
            setIsSaved(true);
            showToast('Navigatsiya saqlandi', 'success');
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error('Navigation save error:', error);
            showToast(
                'Saqlashda xatolik: '
                    + (error instanceof Error ? error.message : 'Noma’lum xatolik'),
                'error',
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h2 className="mb-2 text-3xl font-bold text-slate-900">
                    Navigatsiya sozlamalari
                </h2>
                <p className="text-slate-500">
                    Sayt menyusi va ijtimoiy tarmoq havolalarini boshqaring.
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    <Loader2 size={17} className="animate-spin" />
                    Navigatsiya va kategoriyalar yuklanmoqda...
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_.65fr]">
                <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <Menu size={20} className="text-red-600" />
                            Menyu qatorlari
                        </h3>
                        <button
                            type="button"
                            onClick={addMenuItem}
                            aria-label="Menyu qatori qo‘shish"
                            className="rounded-lg bg-slate-50 p-2 text-red-600 transition-colors hover:bg-slate-100"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.menuItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                            >
                                <GripVertical size={16} className="mt-3 text-slate-400" />
                                <div className="flex-1 space-y-3">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {(['uz', 'ru'] as const).map((itemLang) => (
                                            <label key={itemLang} className="space-y-1">
                                                <span className="text-[11px] font-bold uppercase text-slate-400">
                                                    Nomi ({itemLang})
                                                </span>
                                                <input
                                                    type="text"
                                                    value={getLocalizedText(item.label, itemLang)}
                                                    onChange={(event) => updateMenuLabel(
                                                        index,
                                                        itemLang,
                                                        event.target.value,
                                                    )}
                                                    className="w-full border-b border-slate-200 bg-transparent pb-1 text-sm text-slate-900 outline-none focus:border-red-600"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <label className="relative flex-1">
                                            <LinkIcon
                                                size={13}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                aria-label="Menyu URL manzili"
                                                placeholder="/catalog yoki https://..."
                                                value={getLocalizedText(item.href, 'uz')}
                                                onChange={(event) => updateMenuHref(index, event.target.value)}
                                                className="w-full border-none bg-transparent py-1 pl-5 text-xs text-slate-500 outline-none focus:text-red-600"
                                            />
                                        </label>
                                        <select
                                            aria-label="Kategoriya havolasini tanlash"
                                            className="max-w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none hover:border-red-300 focus:border-red-600 sm:max-w-[180px]"
                                            onChange={(event) => {
                                                if (event.target.value) {
                                                    chooseCategory(index, event.target.value);
                                                    event.target.value = '';
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Kategoriya tanlash...
                                            </option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name.uz}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {typeof item.href !== 'string' && (
                                        <p className="text-[11px] text-slate-400">
                                            RU: {item.href.ru}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeMenuItem(index)}
                                    aria-label="Menyu qatorini o‘chirish"
                                    className="mt-1 p-2 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {formData.menuItems.length === 0 && (
                            <p className="py-4 text-center text-sm text-slate-500">
                                Menyu bo‘sh.
                            </p>
                        )}
                    </div>
                </section>

                <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <Share2 size={20} className="text-red-600" />
                            Ijtimoiy tarmoqlar
                        </h3>
                        <button
                            type="button"
                            onClick={addSocialLink}
                            aria-label="Ijtimoiy tarmoq qo‘shish"
                            className="rounded-lg bg-slate-50 p-2 text-red-600 transition-colors hover:bg-slate-100"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.socialLinks.map((item, index) => (
                            <div
                                key={item.id}
                                className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <select
                                        value={item.platform}
                                        onChange={(event) => updateSocialLink(
                                            index,
                                            'platform',
                                            event.target.value,
                                        )}
                                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-red-600"
                                    >
                                        <option value="instagram">Instagram</option>
                                        <option value="telegram">Telegram</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="twitter">Twitter</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeSocialLink(index)}
                                        aria-label="Ijtimoiy tarmoqni o‘chirish"
                                        className="ml-auto p-1 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={item.url}
                                    onChange={(event) => updateSocialLink(
                                        index,
                                        'url',
                                        event.target.value,
                                    )}
                                    className="w-full border-b border-slate-200 bg-transparent pb-1 text-sm text-blue-600 outline-none focus:border-red-600"
                                />
                            </div>
                        ))}
                        {formData.socialLinks.length === 0 && (
                            <p className="py-4 text-center text-sm text-slate-500">
                                Havolalar yo‘q.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <div className="fixed bottom-6 right-6 z-30 md:right-10">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className={`flex items-center gap-2 rounded-full px-8 py-4 font-bold shadow-2xl transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                        isSaved
                            ? 'bg-green-500 text-slate-900'
                            : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
                    }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Saqlanmoqda...
                        </>
                    ) : isSaved ? (
                        'Saqlandi!'
                    ) : (
                        <>
                            <Save size={20} />
                            O‘zgarishlarni saqlash
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminNavigation;
