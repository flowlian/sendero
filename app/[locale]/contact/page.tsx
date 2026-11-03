import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';
import { ContactForm } from '@/components/features/contact/ContactForm';
import { Link } from '@/lib/i18n/routing';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa6';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonLd';
import { buildAlternates, ogImages } from '@/lib/seo/canonical';
import { buildWhatsAppUrl } from '@/lib/contact';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  const alternates = buildAlternates(locale, '/contact');

  return {
    title: t('title'),
    description: t('description'),
    alternates,
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: alternates.canonical,
      images: ogImages,
    },
  };
}

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations('contactPage');
  const tHeader = useTranslations('header');

  const breadcrumbs = breadcrumbSchema(locale, [
    { name: tHeader('brandName'), path: '' },
    { name: t('title'), path: '/contact' },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <JsonLd data={breadcrumbs} />
      <Header />

      <main className="flex-1 pt-[164px] pb-12 md:pt-[180px] md:pb-16">
        <Container>
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="text-h1 mb-4 mx-auto max-w-heading text-foreground">{t('title')}</h1>
            <p className="text-body mx-auto max-w-text text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {/* Two-Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Contact Information */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="rounded-lg border border-border bg-white p-6 shadow-md md:p-8">
                <h2 className="mb-6 text-h3 text-foreground">{t('contactInfo.heading')}</h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                    <div>
                      <p className="text-label mb-1 font-semibold text-foreground">
                        {t('contactInfo.email.label')}
                      </p>
                      <a
                        href={`mailto:${t('contactInfo.email.value')}`}
                        className="text-body text-primary-600 hover:text-primary-700 transition-colors hover:underline"
                      >
                        {t('contactInfo.email.value')}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-4">
                    <MessageCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                    <div>
                      <p className="text-label mb-1 font-semibold text-foreground">
                        {t('contactInfo.whatsapp.label')}
                      </p>
                      <a
                        href={buildWhatsAppUrl(t('whatsappMessage'))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-primary-600 hover:text-primary-700 transition-colors hover:underline"
                      >
                        {t('contactInfo.whatsapp.cta')} →
                      </a>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start gap-4">
                    <FaInstagram className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                    <div>
                      <p className="text-label mb-1 font-semibold text-foreground">
                        {t('contactInfo.instagram.label')}
                      </p>
                      <a
                        href="https://www.instagram.com/sendero_bike_trails/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-primary-600 hover:text-primary-700 transition-colors hover:underline"
                      >
                        {t('contactInfo.instagram.handle')} →
                      </a>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="mt-6 rounded-md bg-accent-100 p-4">
                    <p className="text-body text-muted-foreground">
                      {t('contactInfo.responseTime')}
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link Card */}
              <div className="rounded-lg border border-border bg-accent-50 p-6 shadow-md md:p-8">
                <div className="flex items-start gap-4">
                  <HelpCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600" />
                  <div>
                    <p className="text-body mb-2 font-medium text-foreground">
                      {t('faqLink.text')}
                    </p>
                    <Link
                      href="/faq"
                      className="text-body text-primary-600 hover:text-primary-700 transition-colors font-semibold hover:underline"
                    >
                      {t('faqLink.linkText')} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
