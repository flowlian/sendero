import { buildWhatsAppUrl, WHATSAPP_NUMBER } from '@/lib/contact';

describe('buildWhatsAppUrl', () => {
  it('links to Julian\'s number', () => {
    expect(buildWhatsAppUrl('Hola')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola`);
  });

  it('encodes umlauts, inverted punctuation and line breaks', () => {
    const url = buildWhatsAppUrl('¡Hola! Größe?\nNächste Zeile & mehr');
    const text = new URL(url).searchParams.get('text');

    expect(text).toBe('¡Hola! Größe?\nNächste Zeile & mehr');
    expect(url).toContain('%0A');
    expect(url).not.toContain(' ');
  });
});
