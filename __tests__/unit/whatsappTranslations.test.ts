import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import esMessages from '@/messages/es.json';

const keysOf = (node: unknown, prefix = ''): string[] =>
  typeof node === 'object' && node !== null
    ? Object.entries(node).flatMap(([key, value]) => keysOf(value, prefix ? `${prefix}.${key}` : key))
    : [prefix];

describe('whatsapp translation keys', () => {
  const enKeys = keysOf(enMessages.whatsapp).sort();

  it.each([
    ['de', deMessages],
    ['es', esMessages],
  ])('%s has the same whatsapp keys as en', (_, messages) => {
    expect(keysOf(messages.whatsapp).sort()).toEqual(enKeys);
  });

  it.each([
    ['en', enMessages],
    ['de', deMessages],
    ['es', esMessages],
  ])('%s has non-empty strings and a {page} placeholder', (_, messages) => {
    keysOf(messages.whatsapp).forEach((path) => {
      const value = path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages.whatsapp);
      expect(typeof value).toBe('string');
      expect((value as string).trim().length).toBeGreaterThan(0);
    });
    expect(messages.whatsapp.message.questionOnPage).toContain('{page}');
    expect(messages.datenschutz.whatsappText.trim().length).toBeGreaterThan(0);
  });
});
