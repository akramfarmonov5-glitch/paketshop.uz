import 'server-only';
import { DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from '@/constants';
import {
  normalizeHeroContent,
  normalizeNavigationSettings,
} from '@/lib/siteSettings';
import type { HeroContent, NavigationSettings } from '@/types';

async function readSetting(key: string): Promise<unknown> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db } = await import('@/lib/server/db');
    return (await db.siteSetting.findUnique({ where: { key } }))?.value ?? null;
  } catch (error) {
    console.error(`Could not read site setting "${key}":`, error);
    return null;
  }
}

export async function getHeroContentSetting(): Promise<HeroContent> {
  const value = await readSetting('hero_content');
  return value ? normalizeHeroContent(value) : DEFAULT_HERO_CONTENT;
}

export async function getNavigationSettingsSetting(): Promise<NavigationSettings> {
  const value = await readSetting('navigation_settings');
  return value ? normalizeNavigationSettings(value) : DEFAULT_NAVIGATION;
}
