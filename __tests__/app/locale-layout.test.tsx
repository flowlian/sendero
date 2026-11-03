import React from 'react';

const mockSetRequestLocale = jest.fn();
const mockGetMessages = jest.fn();
const mockNotFound = jest.fn();

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="intl-provider">{children}</div>
  ),
}));

jest.mock('next-intl/server', () => ({
  getMessages: (...args: unknown[]) => mockGetMessages(...args),
  getTranslations: jest.fn(),
  setRequestLocale: (...args: unknown[]) => mockSetRequestLocale(...args),
}));

jest.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('notFound');
  },
}));

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

jest.mock('@/components/features/feedback/FloatingFeedbackButton', () => ({
  FloatingFeedbackButton: () => null,
}));

jest.mock('@/components/features/whatsapp/WhatsAppWidget', () => ({
  WhatsAppWidget: () => null,
}));

jest.mock('@/components/seo/JsonLd', () => ({
  JsonLd: () => null,
}));

jest.mock('@/lib/seo/jsonLd', () => ({
  organizationSchema: () => ({}),
  localBusinessSchema: () => ({}),
  websiteSchema: () => ({}),
}));

jest.mock('@/lib/seo/canonical', () => ({
  buildAlternates: () => ({ canonical: '/', languages: {} }),
  getSiteUrl: () => 'https://www.senderobiketrails.com',
}));

async function importLocaleLayout() {
  const module = await import('@/app/[locale]/layout');
  return module.default;
}

describe('LocaleLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMessages.mockResolvedValue({
      header: {
        skipToContent: 'Zum Inhalt springen',
      },
    });
  });

  it('loads messages for the route locale instead of fallback locale context', async () => {
    const LocaleLayout = await importLocaleLayout();
    const element = await LocaleLayout({
      children: <div>child</div>,
      params: Promise.resolve({ locale: 'de' }),
    });

    expect(mockSetRequestLocale).toHaveBeenCalledWith('de');
    expect(mockGetMessages).toHaveBeenCalledWith({ locale: 'de' });
    expect(mockNotFound).not.toHaveBeenCalled();

    const bodyElement = (element as React.ReactElement<{ children: React.ReactElement | React.ReactElement[] }>).props.children;
    const bodyChildren = (bodyElement as React.ReactElement<{ children: React.ReactNode }>).props.children;
    const childArray = React.Children.toArray(bodyChildren) as React.ReactElement[];
    const providerElement = childArray.find(
      (child) => (child.props as { locale?: string }).locale !== undefined
    ) as React.ReactElement<{ locale: string; messages: unknown }>;

    expect((providerElement as React.ReactElement<{ locale: string; messages: unknown }>).props.locale).toBe('de');
    expect((providerElement as React.ReactElement<{ locale: string; messages: unknown }>).props.messages).toEqual({
      header: {
        skipToContent: 'Zum Inhalt springen',
      },
    });
  });

  it('returns notFound for unsupported locales', async () => {
    const LocaleLayout = await importLocaleLayout();
    await expect(
      LocaleLayout({
        children: <div>child</div>,
        params: Promise.resolve({ locale: 'fr' }),
      })
    ).rejects.toThrow('notFound');

    expect(mockNotFound).toHaveBeenCalledTimes(1);
    expect(mockSetRequestLocale).not.toHaveBeenCalled();
    expect(mockGetMessages).not.toHaveBeenCalled();
  });
});
