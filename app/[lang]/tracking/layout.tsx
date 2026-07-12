import { privatePageMetadata } from '@/lib/seo';

export const metadata = privatePageMetadata;

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
