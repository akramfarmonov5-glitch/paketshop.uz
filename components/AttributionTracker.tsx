'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordAttributionTouch } from '@/lib/attribution';

export default function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordAttributionTouch();
  }, [pathname]);

  return null;
}
