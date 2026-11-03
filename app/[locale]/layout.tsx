import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { CookieBanner } from '@/components/features/cookie-consent/CookieBanner';
import { WhatsAppWidget } from '@/components/features/whatsapp/WhatsAppWidget';
import ScrollRestorer from '@/components/ScrollRestorer';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { PostHogProvider } from '@/components/PostHogProvider';
import { PostHogPageView } from '@/components/PostHogPageView';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
} from '@/lib/seo/jsonLd';
import { buildAlternates, getSiteUrl, ogImages } from '@/lib/seo/canonical';
import { aboreto } from '@/lib/fonts';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const siteUrl = getSiteUrl();
  const alternates = buildAlternates(locale, '');

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', '),
    authors: [{ name: 'Sendero Bike Trails' }],
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: alternates.canonical,
      siteName: t('siteName'),
      locale: locale === 'en' ? 'en_US' : locale === 'de' ? 'de_DE' : 'es_ES',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${siteUrl}/opengraph-image.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates,
    icons: {
      icon: '/Favicon.svg',
      shortcut: '/Favicon.svg',
      apple: '/Favicon.svg',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const validatedLocale = locale as Locale;

  // Bind the request locale explicitly so message resolution does not
  // depend on middleware/header locale negotiation.
  setRequestLocale(validatedLocale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale: validatedLocale });

  return (
    <html lang={validatedLocale} className={aboreto.variable}>
      <body className="font-sans antialiased">
        <ScrollRestorer />
        <JsonLd
          data={[
            organizationSchema(),
            localBusinessSchema(),
            websiteSchema(validatedLocale),
          ]}
        />
        <NextIntlClientProvider locale={validatedLocale} messages={messages}>
          <PostHogProvider>
            <PostHogPageView />
            {children}
          </PostHogProvider>
          <CookieBanner />
          <WhatsAppWidget />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
