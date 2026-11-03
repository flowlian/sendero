/** Julian's WhatsApp number in international format, without "+" or spaces */
export const WHATSAPP_NUMBER = '4917631470193';

/** A wa.me link that opens a chat with Julian with `text` already typed */
export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
