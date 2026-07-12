import 'server-only';
import { localizeTargetPath, redirectLookupCandidates, splitLocale } from '@/lib/domain/redirects';
import { db } from '@/lib/server/db';

export interface ResolvedRedirect {
  target: string;
  statusCode: number;
}

/**
 * Kiruvchi yo'l uchun faol redirectni topadi (spec §27).
 * fromPath til prefiksi bilan ham, prefikssiz ham saqlangan bo'lishi mumkin;
 * tilsiz toPath so'ralgan til bilan to'ldiriladi.
 */
export async function findActiveRedirect(path: string): Promise<ResolvedRedirect | null> {
  const candidates = redirectLookupCandidates(path);
  if (!candidates.length) return null;

  const redirects = await db.redirect.findMany({ where: { active: true, fromPath: { in: candidates } } });
  if (!redirects.length) return null;

  // Aniq (til prefiksli) moslik prefikssizdan ustun turadi.
  const match = candidates
    .map((candidate) => redirects.find((row) => row.fromPath === candidate))
    .find(Boolean);
  if (!match) return null;

  const { locale } = splitLocale(redirectLookupCandidates(path)[0]);
  return {
    target: localizeTargetPath(match.toPath, locale),
    statusCode: match.statusCode,
  };
}
