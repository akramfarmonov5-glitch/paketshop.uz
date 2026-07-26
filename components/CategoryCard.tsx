import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Box, CakeSlice, CupSoda, Layers, Package, PackageOpen, Scroll,
  ShoppingBag, Sparkles, Trash2, TreePine, UtensilsCrossed, Utensils, Wrench,
} from 'lucide-react';
import { categoryIconName, categoryTone, type CategoryIconName } from '@/lib/domain/categoryIcons';

const ICONS: Record<CategoryIconName, typeof Box> = {
  cup: CupSoda,
  utensils: Utensils,
  container: Package,
  sauce: UtensilsCrossed,
  kraftBag: ShoppingBag,
  plasticBag: PackageOpen,
  zipBag: Layers,
  trashBag: Trash2,
  stretch: Scroll,
  foodFilm: Scroll,
  foil: Scroll,
  pastry: CakeSlice,
  cutlery: Utensils,
  napkin: Layers,
  household: Wrench,
  party: Sparkles,
  newYear: TreePine,
  box: Box,
};

interface Props {
  href: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
  countLabel?: string;
}

export default function CategoryCard({ href, name, slug, image, productCount, countLabel }: Props) {
  const Icon = ICONS[categoryIconName(slug)];
  const tone = categoryTone(slug);

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-red-300 hover:shadow-md sm:flex-col sm:items-stretch sm:gap-0 sm:p-0"
    >
      {image ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-b-none">
          <Image src={image} alt={name} fill sizes="(max-width: 640px) 64px, 25vw" className="object-contain p-1.5 sm:p-4" />
        </div>
      ) : (
        // Rasm yo'q — logotipni takrorlash o'rniga kategoriyaga mos ikonka
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-xl sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-b-none ${tone}`}>
          <Icon size={26} strokeWidth={1.75} className="sm:hidden" />
          <Icon size={40} strokeWidth={1.5} className="hidden sm:block" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:p-4">
        <div className="min-w-0">
          <h3 className="truncate font-bold leading-6 group-hover:text-red-700 sm:whitespace-normal">{name}</h3>
          {productCount != null && productCount > 0 && (
            <p className="mt-0.5 text-xs text-slate-500">{productCount} {countLabel || 'ta mahsulot'}</p>
          )}
        </div>
        <ArrowRight size={17} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-red-600" />
      </div>
    </Link>
  );
}
