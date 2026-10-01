import { describe, expect, it } from 'vitest';
import {
  formatWidgetReply,
  plainChatText,
  sitePageUrl,
  splitTextLinks,
  toAssistantHistory,
  wrapPcmAsWav,
} from '@/lib/domain/assistantChat';

describe('toAssistantHistory', () => {
  it('converts Gemini-style widget history', () => {
    expect(toAssistantHistory([
      { role: 'user', parts: [{ text: 'Salom' }] },
      { role: 'model', parts: [{ text: 'Assalomu alaykum' }] },
    ])).toEqual([
      { role: 'user', content: 'Salom' },
      { role: 'model', content: 'Assalomu alaykum' },
    ]);
    expect(toAssistantHistory(undefined)).toEqual([]);
  });
});

describe('plainChatText', () => {
  it('removes markdown and internal tags', () => {
    expect(plainChatText('## Narx\n**85 000 so\'m** __qadoq__\n\n\n\nRahmat [BUYURTMA: 12]')).toBe("Narx\n85 000 so'm qadoq\n\nRahmat");
    expect(plainChatText('[IMAGE: https://x.uz/a.jpg] Matn [VIDEO: https://x.uz/v.mp4]')).toBe('Matn');
  });
});

describe('sitePageUrl', () => {
  it('accepts only paketshop.uz pages and switches the locale for Russian readers', () => {
    expect(sitePageUrl('https://www.paketshop.uz/uz/product/kraft-12', 'uz')).toBe('https://www.paketshop.uz/uz/product/kraft-12');
    expect(sitePageUrl('https://paketshop.uz/uz/product/kraft-12', 'ru')).toBe('https://www.paketshop.uz/ru/product/kraft-12');
    expect(sitePageUrl('https://paketshop.uz/ru/product/kraft-12', 'ru')).toBe('https://www.paketshop.uz/ru/product/kraft-12');
  });

  it('rejects other hosts, schemes and non-strings', () => {
    expect(sitePageUrl('https://evil.example/uz/product/x', 'uz')).toBeNull();
    expect(sitePageUrl('https://www.paketshop.uz.evil.example/uz/product/x', 'uz')).toBeNull();
    expect(sitePageUrl('http://www.paketshop.uz/uz/product/x', 'uz')).toBeNull();
    expect(sitePageUrl('javascript:alert(1)', 'uz')).toBeNull();
    expect(sitePageUrl('not a url', 'uz')).toBeNull();
    expect(sitePageUrl(undefined, 'uz')).toBeNull();
  });
});

describe('formatWidgetReply', () => {
  it('cleans the reply and appends the product page once', () => {
    const url = 'https://www.paketshop.uz/uz/product/kraft-12';
    expect(formatWidgetReply('**Kraft paket** bor. [BUYURTMA: 3]', url, 'uz')).toBe(`Kraft paket bor.\n\nMahsulot sahifasi: ${url}`);
    expect(formatWidgetReply(`Mana: ${url}`, url, 'uz')).toBe(`Mana: ${url}`);
  });

  it('labels the link in the reader language', () => {
    expect(formatWidgetReply('Есть.', 'https://www.paketshop.uz/uz/product/kraft-12', 'ru'))
      .toBe('Есть.\n\nСтраница товара: https://www.paketshop.uz/ru/product/kraft-12');
  });

  it('returns an empty string when there is nothing to show', () => {
    expect(formatWidgetReply(undefined, null, 'uz')).toBe('');
    expect(formatWidgetReply('  [BUYURTMA: 3]  ', null, 'uz')).toBe('');
  });

  it('caps very long replies', () => {
    expect(formatWidgetReply('a'.repeat(9000), null, 'uz')).toHaveLength(4000);
  });
});

describe('wrapPcmAsWav', () => {
  it('writes a 24 kHz mono 16-bit WAV header in front of the samples', () => {
    const pcm = Buffer.from([1, 0, 2, 0, 3, 0]);
    const wav = wrapPcmAsWav(pcm);

    expect(wav.subarray(0, 4).toString()).toBe('RIFF');
    expect(wav.subarray(8, 12).toString()).toBe('WAVE');
    expect(wav.readUInt32LE(4)).toBe(36 + pcm.length);
    expect(wav.readUInt16LE(22)).toBe(1);
    expect(wav.readUInt32LE(24)).toBe(24_000);
    expect(wav.readUInt16LE(34)).toBe(16);
    expect(wav.readUInt32LE(40)).toBe(pcm.length);
    expect(wav.subarray(44)).toEqual(pcm);
  });
});

describe('splitTextLinks', () => {
  it('makes paketshop.uz and t.me addresses clickable without trailing punctuation', () => {
    expect(splitTextLinks('Saytga qarang: https://www.paketshop.uz/uz/product/x-1. Telegram: https://t.me/paketshop_uz!')).toEqual([
      { text: 'Saytga qarang: ' },
      { text: 'https://www.paketshop.uz/uz/product/x-1', href: 'https://www.paketshop.uz/uz/product/x-1' },
      { text: '. Telegram: ' },
      { text: 'https://t.me/paketshop_uz', href: 'https://t.me/paketshop_uz' },
      { text: '!' },
    ]);
  });

  it('leaves other hosts and look-alike domains as plain text', () => {
    const text = 'https://evil.example/x va https://www.paketshop.uz.evil.example/y';
    expect(splitTextLinks(text)).toEqual([{ text }]);
  });

  it('returns the text untouched when there are no links', () => {
    expect(splitTextLinks('Salom!')).toEqual([{ text: 'Salom!' }]);
    expect(splitTextLinks('')).toEqual([{ text: '' }]);
  });
});
