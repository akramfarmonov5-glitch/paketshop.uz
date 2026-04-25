import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const { isDark } = useTheme();
  
  const baseClasses = `animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`;
  
  const variantClasses = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const ProductSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col h-full ${isDark ? 'bg-dark-900 border-white/5' : 'bg-white border-light-border'}`}>
      <div className="aspect-[4/5] sm:aspect-square relative w-full">
        <Skeleton className="w-full h-full rounded-none" variant="rectangular" />
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3" variant="text" />
          <Skeleton className="h-5 w-3/4" variant="text" />
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-5/6" variant="text" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-1/3" variant="text" />
          <Skeleton className="h-8 w-8 rounded-full" variant="circular" />
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden ${isDark ? 'bg-dark-900' : 'bg-gray-100'}`}>
      <Skeleton className="w-full h-full rounded-none" variant="rectangular" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
        <Skeleton className="h-6 w-2/3 mb-2 bg-white/20" variant="text" />
        <Skeleton className="h-4 w-1/2 bg-white/20" variant="text" />
      </div>
    </div>
  );
};

export const BlogSkeleton = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`rounded-3xl overflow-hidden flex flex-col border ${isDark ? 'bg-dark-900 border-white/10' : 'bg-white border-light-border'}`}>
      <div className="aspect-[16/10]">
        <Skeleton className="w-full h-full rounded-none" variant="rectangular" />
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-3 w-20" variant="text" />
        </div>
        <Skeleton className="h-6 w-full mb-2" variant="text" />
        <Skeleton className="h-6 w-4/5 mb-4" variant="text" />
        <Skeleton className="h-4 w-full mb-2" variant="text" />
        <Skeleton className="h-4 w-5/6 mb-6" variant="text" />
        <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  const { isDark } = useTheme();

  return (
    <div className={`pt-24 pb-20 min-h-screen ${isDark ? 'bg-black' : 'bg-light-bg'}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <Skeleton className="h-4 w-48 mb-8" variant="text" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-6 space-y-3">
            <div className={`aspect-square md:aspect-[4/3] w-full rounded-2xl md:rounded-3xl border ${isDark ? 'bg-dark-900 border-white/5' : 'bg-white border-light-border'}`}>
              <Skeleton className="w-full h-full rounded-none" variant="rectangular" />
            </div>
            <div className="flex gap-2 md:gap-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl" variant="rectangular" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div>
              <Skeleton className="h-3 w-20 mb-3" variant="text" />
              <Skeleton className="h-10 md:h-12 w-full mb-4" variant="text" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24 rounded" variant="rectangular" />
                <Skeleton className="h-6 w-32 rounded" variant="rectangular" />
              </div>
            </div>
            <div className={`py-6 border-t border-b ${isDark ? 'border-white/10' : 'border-gray-200'} space-y-4`}>
              <Skeleton className="h-8 md:h-10 w-1/3 mb-4" variant="text" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 md:h-14 rounded-xl" variant="rectangular" />
                <Skeleton className="h-12 md:h-14 rounded-xl" variant="rectangular" />
              </div>
              <Skeleton className="h-12 md:h-14 w-full rounded-xl" variant="rectangular" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 mb-2" variant="text" />
              <Skeleton className="h-4 w-full" variant="text" />
              <Skeleton className="h-4 w-full" variant="text" />
              <Skeleton className="h-4 w-4/5" variant="text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
