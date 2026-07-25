'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Edit3, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { slugify } from '@/lib/slugify';
import ProductVariantTierEditor from './ProductVariantTierEditor';
import ProductMediaEditor, { type MediaDraft } from './ProductMediaEditor';
import {
  draftToTierPayload,
  draftToVariantPayload,
  resolveProductSlugs,
  tierRowToDraft,
  validateDrafts,
  variantRowToDraft,
  type TierDraft,
  type VariantDraft,
} from '@/lib/admin/productDrafts';

interface CategoryOption { id: string; translations: Array<{ locale: string; name: string }> }
interface ProductRecord {
  id: string; sku: string; legacySku?: string | null; slugUz: string; slugRu: string; categoryId: string; status: string; availabilityStatus: string; priceMode: string; baseUnit: string; saleUnit: string; unitsPerPack: number; packsPerCarton: number; unitsPerCarton: number; minimumOrderQuantity: number; orderStep: number; publicPrice: string | number | null; originCountry?: string | null; isFeatured: boolean; isNew: boolean; isBestSeller: boolean; isSeasonal: boolean; translations: Array<{ locale: string; name: string; shortDescription?: string | null; description?: string | null }>; variants: Array<Record<string, unknown>>; priceTiers: Array<Record<string, unknown>>;
  media?: Array<{ sortOrder?: number; primary?: boolean; media: { id: string; url: string; altUz?: string | null } }>;
}

const initialForm = { sku: '', nameUz: '', nameRu: '', categoryId: '', publicPrice: '', unitsPerPack: 1, packsPerCarton: 1, minimumOrderQuantity: 1, orderStep: 1, saleUnit: 'PACK', availabilityStatus: 'CHECK_AVAILABILITY', priceMode: 'PUBLIC_EXACT', originCountry: '' };

// Maydon yozuvlari: qiymat turganda placeholder ko'rinmagani uchun har biriga doimiy label kerak.
const fieldLabel = 'mb-1 block text-xs font-medium text-slate-500';
const fieldInput = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5';
const saleUnitLabels: Record<string, string> = { PACK: '1 qadoq', CARTON: '1 korobka', PIECE: '1 dona', ROLL: '1 rulon', KILOGRAM: '1 kg' };

export default function AdminProductsV2() {
  const [products, setProducts] = useState<ProductRecord[]>([]); const [categories, setCategories] = useState<CategoryOption[]>([]); const [form, setForm] = useState(initialForm); const [editing, setEditing] = useState<ProductRecord | null>(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [query, setQuery] = useState('');
  const [variants, setVariants] = useState<VariantDraft[]>([]); const [tiers, setTiers] = useState<TierDraft[]>([]); const [media, setMedia] = useState<MediaDraft[]>([]); const [showArchived, setShowArchived] = useState(false);
  const categoryName = useMemo(() => new Map(categories.map((category) => [category.id, category.translations.find((translation) => translation.locale === 'uz')?.name || category.id])), [categories]);

  const load = async () => { setLoading(true); setError(''); try { const [productsResponse, categoriesResponse] = await Promise.all([fetch(`/api/admin/products?q=${encodeURIComponent(query)}`), fetch('/api/admin/categories')]); const productsResult = await productsResponse.json(); const categoriesResult = await categoriesResponse.json(); if (!productsResponse.ok || !categoriesResponse.ok) throw new Error(productsResult.error || categoriesResult.error || 'Ma’lumot yuklanmadi'); setProducts(productsResult.products); setCategories(categoriesResult.categories); setForm((current) => ({ ...current, categoryId: current.categoryId || categoriesResult.categories[0]?.id || '' })); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Xatolik'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const edit = (product: ProductRecord) => { const uz = product.translations.find((translation) => translation.locale === 'uz'); const ru = product.translations.find((translation) => translation.locale === 'ru'); setEditing(product); setForm({ sku: product.sku, nameUz: uz?.name || '', nameRu: ru?.name || '', categoryId: product.categoryId, publicPrice: product.publicPrice == null ? '' : String(product.publicPrice), unitsPerPack: product.unitsPerPack, packsPerCarton: product.packsPerCarton, minimumOrderQuantity: product.minimumOrderQuantity, orderStep: product.orderStep, saleUnit: product.saleUnit, availabilityStatus: product.availabilityStatus, priceMode: product.priceMode, originCountry: product.originCountry || '' });
    // Baza qatorlarini forma qoralamasiga aylantiramiz: `id`/`productId` va null qiymatlar
    // strict sxemaga tushmasligi kerak.
    setVariants((product.variants || []).map(variantRowToDraft));
    setTiers((product.priceTiers || []).map(tierRowToDraft));
    // Rasmlar asosiysi birinchi bo'ladigan tartibda yuklanadi
    setMedia([...(product.media || [])]
      .sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((entry) => ({ id: entry.media.id, url: entry.media.url, altUz: entry.media.altUz })));
    setError('');
  };
  const reset = () => { setEditing(null); setForm({ ...initialForm, categoryId: categories[0]?.id || '' }); setVariants([]); setTiers([]); setMedia([]); };

  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError('');
    const draftError = validateDrafts(form.sku, variants, tiers);
    if (draftError) { setError(draftError); return; }
    setSaving(true);
    // Mavjud mahsulotning slug'i va legacySku'si saqlanadi — ular public URL va eski havolalar uchun.
    const { slugUz, slugRu } = resolveProductSlugs(editing, form.nameUz, slugify);
    const payload = { sku: form.sku, slugUz, slugRu, legacySku: editing?.legacySku ?? null, categoryId: form.categoryId, status: 'ACTIVE', availabilityStatus: form.availabilityStatus, priceMode: form.priceMode, baseUnit: 'PIECE', saleUnit: form.saleUnit, unitsPerPack: form.unitsPerPack, packsPerCarton: form.packsPerCarton, unitsPerCarton: form.unitsPerPack * form.packsPerCarton, minimumOrderQuantity: form.minimumOrderQuantity, orderStep: form.orderStep, publicPrice: form.publicPrice === '' ? null : Number(form.publicPrice), originCountry: form.originCountry || null, name: { uz: form.nameUz, ru: form.nameRu }, shortDescription: editing ? { uz: editing.translations.find((translation) => translation.locale === 'uz')?.shortDescription || '', ru: editing.translations.find((translation) => translation.locale === 'ru')?.shortDescription || '' } : undefined, description: editing ? { uz: editing.translations.find((translation) => translation.locale === 'uz')?.description || '', ru: editing.translations.find((translation) => translation.locale === 'ru')?.description || '' } : undefined, isFeatured: editing?.isFeatured || false, isNew: editing?.isNew || false, isBestSeller: editing?.isBestSeller || false, isSeasonal: editing?.isSeasonal || false, variants: variants.map(draftToVariantPayload), priceTiers: tiers.map(draftToTierPayload), mediaIds: media.map((entry) => entry.id) };
    try { const response = await fetch(editing ? `/api/admin/products/${editing.id}` : '/api/admin/products', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Mahsulot saqlanmadi'); reset(); await load(); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Xatolik'); } finally { setSaving(false); } };
  // Faol mahsulot arxivlanadi (qaytarish mumkin), arxivlangani butunlay o'chiriladi.
  const archive = async (product: ProductRecord) => {
    const isArchived = product.status === 'ARCHIVED';
    const message = isArchived
      ? `"${product.sku}" ni butunlay o‘chirasizmi?\n\nBu amalni qaytarib bo‘lmaydi. Buyurtmalardagi yozuvlar saqlanib qoladi.`
      : `"${product.sku}" ni arxivlaysizmi?\n\nU saytdan yo‘qoladi, lekin ro‘yxatda "Arxivlangan" bo‘lib qoladi va tahrirlab qaytarish mumkin.`;
    if (!window.confirm(message)) return;

    setError('');
    const response = await fetch(`/api/admin/products/${product.id}${isArchived ? '?permanent=true' : ''}`, { method: 'DELETE' });
    if (response.ok) await load();
    else setError(isArchived ? 'Mahsulotni o‘chirib bo‘lmadi' : 'Mahsulotni arxivlab bo‘lmadi');
  };

  const visibleProducts = showArchived ? products : products.filter((product) => product.status !== 'ARCHIVED');
  const archivedCount = products.filter((product) => product.status === 'ARCHIVED').length;

  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">B2B mahsulotlar</h2><p className="text-sm text-slate-500">SKU, qadoq, korobka va narx birligi</p></div><div className="flex flex-wrap items-center gap-2">{archivedCount > 0 && <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-red-600" />Arxivlanganlar ({archivedCount})</label>}<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="SKU yoki nom" className="rounded-xl border border-slate-200 bg-white px-3 py-2" /><button onClick={() => void load()} className="rounded-xl border border-slate-200 p-2.5"><RefreshCw size={18} /></button></div></div>
    {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">{editing ? `${editing.sku} ni tahrirlash` : 'Yangi mahsulot'}</h3>{editing && <button type="button" onClick={reset} className="p-1 text-slate-500"><X size={18} /></button>}</div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <label className="block"><span className={fieldLabel}>SKU (mahsulot kodi) *</span><input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} placeholder="masalan ST-250-KR" className={`${fieldInput} font-mono`} /></label>
      <label className="block"><span className={fieldLabel}>O‘zbekcha nom *</span><input required value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })} placeholder="Kraft qog‘oz stakan, 250 ml" className={fieldInput} /></label>
      <label className="block"><span className={fieldLabel}>Ruscha nom *</span><input required value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })} placeholder="Крафт-стакан, 250 мл" className={fieldInput} /></label>
      <label className="block"><span className={fieldLabel}>Kategoriya *</span><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={fieldInput}><option value="">— tanlang —</option>{categories.filter((category) => (category as CategoryOption & { active?: boolean }).active !== false).map((category) => <option key={category.id} value={category.id}>{categoryName.get(category.id)}</option>)}</select></label>
      <label className="block"><span className={fieldLabel}>{saleUnitLabels[form.saleUnit] || 'Qadoq'} narxi, so‘m</span><input type="number" min="0" value={form.publicPrice} onChange={(e) => setForm({ ...form, publicPrice: e.target.value })} placeholder="masalan 47500" className={fieldInput} /></label>
      <label className="block"><span className={fieldLabel}>Qadoqdagi dona</span><input type="number" min="1" value={form.unitsPerPack} onChange={(e) => setForm({ ...form, unitsPerPack: Number(e.target.value) })} className={fieldInput} /></label>
      <label className="block"><span className={fieldLabel}>Korobkadagi qadoq</span><input type="number" min="1" value={form.packsPerCarton} onChange={(e) => setForm({ ...form, packsPerCarton: Number(e.target.value) })} className={fieldInput} /></label>
      <label className="block"><span className={fieldLabel}>Ishlab chiqarilgan mamlakat</span><input value={form.originCountry} onChange={(e) => setForm({ ...form, originCountry: e.target.value })} placeholder="masalan Uzbekistan" className={fieldInput} /></label>
      <label className="block"><span className={fieldLabel}>Sotuv birligi</span><select value={form.saleUnit} onChange={(e) => setForm({ ...form, saleUnit: e.target.value })} className={fieldInput}><option value="PACK">Qadoq</option><option value="CARTON">Korobka</option><option value="PIECE">Dona</option><option value="ROLL">Rulon</option><option value="KILOGRAM">Kilogramm</option></select></label>
      <label className="block"><span className={fieldLabel}>Mavjudlik</span><select value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })} className={fieldInput}><option value="IN_STOCK">Omborda mavjud</option><option value="LOW_STOCK">Kam qoldi</option><option value="CHECK_AVAILABILITY">Qoldiqni aniqlash</option><option value="ON_ORDER">Buyurtma asosida</option><option value="OUT_OF_STOCK">Vaqtincha yo‘q</option></select></label>
      <label className="block"><span className={fieldLabel}>Narx rejimi</span><select value={form.priceMode} onChange={(e) => setForm({ ...form, priceMode: e.target.value })} className={fieldInput}><option value="PUBLIC_EXACT">Aniq narx</option><option value="FROM_PRICE">...dan boshlab</option><option value="REQUEST_ONLY">Narxni so‘rash</option></select></label>
      <div className="flex items-end"><p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">Korobkada jami: <strong className="text-slate-900">{(form.unitsPerPack || 1) * (form.packsPerCarton || 1)} dona</strong></p></div></div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <ProductMediaEditor media={media} onChange={setMedia} />
      </div>
      <div className="mt-4">
        <ProductVariantTierEditor saleUnit={form.saleUnit} variants={variants} tiers={tiers} onVariantsChange={setVariants} onTiersChange={setTiers} />
      </div>
      <div className="mt-4 flex justify-end">
        <button disabled={saving || !form.categoryId} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}{editing ? 'Saqlash' : 'Qo‘shish'}</button>
      </div>
    </form>
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">{loading ? <div className="p-10 text-center"><Loader2 className="mx-auto animate-spin" /></div> : <table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">SKU</th><th className="p-3">Mahsulot</th><th className="p-3">Kategoriya</th><th className="p-3">Qadoq / korobka</th><th className="p-3">Narx</th><th className="p-3">Variant / daraja</th><th className="p-3">Holat</th><th className="p-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{visibleProducts.map((product) => <tr key={product.id} className={product.status === 'ARCHIVED' ? 'bg-slate-50 text-slate-400' : ''}><td className="p-3 font-mono">{product.sku}</td><td className="p-3 font-medium">{product.translations.find((translation) => translation.locale === 'uz')?.name}{product.status === 'ARCHIVED' && <span className="ml-2 rounded-md bg-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">Arxivlangan</span>}</td><td className="p-3 text-slate-500">{categoryName.get(product.categoryId)}</td><td className="p-3">{product.unitsPerPack} / {product.unitsPerCarton}</td><td className="p-3">{product.publicPrice == null ? 'So‘rov' : Number(product.publicPrice).toLocaleString('uz-UZ')}</td><td className="p-3 text-slate-500">{product.variants?.length || 0} / {product.priceTiers?.length || 0}</td><td className="p-3 text-slate-500">{product.availabilityStatus}</td><td className="p-3"><div className="flex gap-2"><button onClick={() => edit(product)} className="p-2 text-blue-400" aria-label="Tahrirlash"><Edit3 size={17} /></button><button onClick={() => void archive(product)} className="p-2 text-red-400 hover:text-red-600" aria-label={product.status === 'ARCHIVED' ? `${product.sku} ni butunlay o‘chirish` : `${product.sku} ni arxivlash`} title={product.status === 'ARCHIVED' ? 'Butunlay o‘chirish' : 'Arxivlash'}>{product.status === 'ARCHIVED' ? <Trash2 size={17} /> : <Archive size={17} />}</button></div></td></tr>)}</tbody></table>}</div>
  </div>;
}
