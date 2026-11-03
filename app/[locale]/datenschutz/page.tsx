import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/ui/Container';

export default function DatenschutzPage() {
  const t = useTranslations('datenschutz');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 pt-[116px]">
        <section className="py-16 md:py-24">
          <Container>
            <div className="max-w-text flex flex-col gap-8">

              {/* Title */}
              <h1 className="text-h1 font-bold text-foreground">{t('title')}</h1>

              {/* Content */}
              <div className="flex flex-col gap-6 text-body text-foreground leading-relaxed">

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('generalTitle')}</p>
                  <p>{t('generalText')}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-bold">{t('controllerTitle')}</p>
                  <p>sendero bike trails</p>
                  <p>Julian Perez</p>
                  <p>Berlin, Deutschland</p>
                  <p>E-Mail: julian@senderobiketrails.com</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('collectionTitle')}</p>
                  <p>{t('collectionText')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('purposeTitle')}</p>
                  <p>{t('purposeText1')}</p>
                  <p>{t('purposeText2')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('storageTitle')}</p>
                  <p>{t('storageText1')}</p>
                  <p>{t('storageText2')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('transferTitle')}</p>
                  <p>{t('transferText')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('securityTitle')}</p>
                  <p>{t('securityText')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('rightsTitle')}</p>
                  <p>{t('rightsText1')}</p>
                  <p>{t('rightsText2')} <strong>julian@senderobiketrails.com</strong></p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('cookiesTitle')}</p>
                  <p>{t('cookiesText')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('whatsappTitle')}</p>
                  <p>{t('whatsappText')}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-bold">{t('changesTitle')}</p>
                  <p>{t('changesText')}</p>
                </div>

              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
