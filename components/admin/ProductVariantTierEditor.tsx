'use client';

import React from 'react';
import { Layers, Plus, Tags, Trash2 } from 'lucide-react';
import {
  AVAILABILITY_STATUSES,
  SALE_UNITS,
  emptyTierDraft,
  emptyVariantDraft,
  findTierOverlap,
  type TierDraft,
  type VariantDraft,
} from '@/lib/admin/productDrafts';

const AVAILABILITY_LABELS: Record<string, string> = {
  IN_STOCK: 'Omborda mavjud',
  LOW_STOCK: 'Kam qoldi',
  CHECK_AVAILABILITY: 'Qoldiqni aniqlash',
  ON_ORDER: 'Buyurtma asosida',
  OUT_OF_STOCK: 'Vaqtincha yo‘q',
  DISCONTINUED: 'Sotuvdan chiqarilgan',
};

const UNIT_LABELS: Record<string, string> = {
  PIECE: 'dona',
  PACK: 'qadoq',
  CARTON: 'korobka',
  ROLL: 'rulon',
  KILOGRAM: 'kg',
};

const cell = 'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-red-500';

interface Props {
  saleUnit: string;
  variants: VariantDraft[];
  tiers: TierDraft[];
  onVariantsChange: (variants: VariantDraft[]) => void;
  onTiersChange: (tiers: TierDraft[]) => void;
}

export default function ProductVariantTierEditor({ saleUnit, variants, tiers, onVariantsChange, onTiersChange }: Props) {
  const overlapIndex = findTierOverlap(tiers);

  const updateVariant = (index: number, patch: Partial<VariantDraft>) =>
    onVariantsChange(variants.map((variant, position) => (position === index ? { ...variant, ...patch } : variant)));
  const updateTier = (index: number, patch: Partial<TierDraft>) =>
    onTiersChange(tiers.map((tier, position) => (position === index ? { ...tier, ...patch } : tier)));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900">
            <Layers size={17} className="text-red-600" /> Variantlar
            {variants.length > 0 && <span className="rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600">{variants.length}</span>}
          </h4>
          <button
            type="button"
            onClick={() => onVariantsChange([...variants, emptyVariantDraft()])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-500 hover:text-red-700"
          >
            <Plus size={14} /> Variant
          </button>
        </header>

        <p className="mb-3 text-xs leading-5 text-slate-500">
          Rang, hajm yoki o‘lcham farqlarini dublikat mahsulot sifatida emas, variant sifatida kiritiladi. Har bir variantga o‘z SKU’si kerak.
        </p>

        {variants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">Variant qo‘shilmagan</p>
        ) : (
          <ul className="space-y-3">
            {variants.map((variant, index) => (
              <li key={index} className="rounded-xl border border-slate-200 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Variant SKU *</span>
                    <input required value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value.toUpperCase() })} placeholder="ST-250-KR" className={`${cell} font-mono`} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Rang</span>
                    <input value={variant.color} onChange={(event) => updateVariant(index, { color: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">O‘lcham</span>
                    <input value={variant.size} onChange={(event) => updateVariant(index, { size: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Hajm, ml</span>
                    <input type="number" min="1" value={variant.volumeMl} onChange={(event) => updateVariant(index, { volumeMl: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Qalinlik, mkm</span>
                    <input type="number" min="1" value={variant.thicknessMicron} onChange={(event) => updateVariant(index, { thicknessMicron: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Qadoqdagi dona</span>
                    <input type="number" min="1" value={variant.unitsPerPack} onChange={(event) => updateVariant(index, { unitsPerPack: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Narx ({UNIT_LABELS[saleUnit] || 'qadoq'})</span>
                    <input type="number" min="0" value={variant.price} onChange={(event) => updateVariant(index, { price: event.target.value })} className={cell} />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Mavjudlik</span>
                    <select value={variant.availabilityStatus} onChange={(event) => updateVariant(index, { availabilityStatus: event.target.value })} className={cell}>
                      {AVAILABILITY_STATUSES.map((status) => <option key={status} value={status}>{AVAILABILITY_LABELS[status]}</option>)}
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={variant.active} onChange={(event) => updateVariant(index, { active: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-red-600" />
                    Sotuvda
                  </label>
                  <button type="button" onClick={() => onVariantsChange(variants.filter((_, position) => position !== index))} aria-label={`${index + 1}-variantni o‘chirish`} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 font-semibold text-slate-900">
            <Tags size={17} className="text-red-600" /> Narx darajalari
            {tiers.length > 0 && <span className="rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600">{tiers.length}</span>}
          </h4>
          <button
            type="button"
            onClick={() => onTiersChange([...tiers, emptyTierDraft(saleUnit)])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-500 hover:text-red-700"
          >
            <Plus size={14} /> Daraja
          </button>
        </header>

        <p className="mb-3 text-xs leading-5 text-slate-500">
          Miqdor oshgani sari narx pasayadi. Oraliqlar kesishmasligi kerak; oxirgi darajada «eng ko‘p» bo‘sh qoldirilsa, u «va undan yuqori» degani.
        </p>

        {tiers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">Narx darajasi qo‘shilmagan</p>
        ) : (
          <ul className="space-y-2">
            {tiers.map((tier, index) => (
              <li key={index} className={`rounded-xl border p-3 ${overlapIndex === index ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}>
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1.2fr_1fr_auto] sm:items-end">
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Eng kam *</span>
                    <input required type="number" min="1" value={tier.minQuantity} onChange={(event) => updateTier(index, { minQuantity: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Eng ko‘p</span>
                    <input type="number" min="1" value={tier.maxQuantity} onChange={(event) => updateTier(index, { maxQuantity: event.target.value })} placeholder="∞" className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Narx, so‘m *</span>
                    <input required type="number" min="0" value={tier.price} onChange={(event) => updateTier(index, { price: event.target.value })} className={cell} />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-medium text-slate-500">Birlik</span>
                    <select value={tier.priceUnit} onChange={(event) => updateTier(index, { priceUnit: event.target.value })} className={cell}>
                      {SALE_UNITS.map((unit) => <option key={unit} value={unit}>{UNIT_LABELS[unit]}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => onTiersChange(tiers.filter((_, position) => position !== index))} aria-label={`${index + 1}-narx darajasini o‘chirish`} className="mb-1 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                {overlapIndex === index && <p className="mt-2 text-xs font-semibold text-red-700">Bu oraliq oldingi daraja bilan kesishadi</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
