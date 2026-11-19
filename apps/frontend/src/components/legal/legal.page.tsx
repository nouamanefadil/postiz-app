import { ReactNode } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { SourceCodeNotice } from '@gitroom/frontend/components/layout/source.code.notice';
import { PRIVACY_URL, TERMS_URL } from '@gitroom/helpers/utils/brand';

// Tayra Social: the operator details the Terms and the Privacy Policy need.
// An empty value is shown on the pages as a highlighted [TOKEN] placeholder, so
// nothing unconfirmed is published as a fact. The full list of what is still
// missing (including placeholders inside the page text) is in
// deploy/LEGAL-CHECKLIST.md.
export const LEGAL = {
  // Confirmed by the operator: Tayra Social is run by an individual (natural
  // person, not a company) under the trading name Maison Tayra
  tradingName: 'Maison Tayra',
  contactEmail: 'maisontayra@gmail.com',
  // To confirm: full legal name of the individual who operates the Service
  operatorName: '',
  // Confirmed by the operator (2026-11-19)
  address: 'Bassatine Al Firdaouss, GH1, Imm 5, Mag 24, Mohammedia, Morocco',
  // Moroccan identifiers, only if the operator has them (leave empty otherwise
  // and remove the lines from OperatorDetails)
  rc: '',
  ice: '',
  taxId: '',
  // To confirm: support phone number (optional)
  phone: '',
  // To verify: country of the Hostinger data centre (hPanel > VPS > Overview)
  hostingLocation: '',
  // To verify: CNDP declaration / authorisation reference, once obtained
  cndp: '',
  // To confirm: competent courts for disputes
  court: '',
  // Set to false only once every placeholder is resolved and the text reviewed
  draft: true,
  lastUpdated: { en: '19 November 2026', fr: '19 novembre 2026' },
};

export type LegalLang = 'en' | 'fr';

// ?lang=en|fr wins, then the interface language cookie (French interface ->
// French text), else English. Arabic and the other interfaces read English.
export const legalLang = async (
  searchParams: Promise<{ lang?: string }>
): Promise<LegalLang> => {
  const { lang } = await searchParams;
  if (lang === 'en' || lang === 'fr') {
    return lang;
  }
  return (await cookies()).get('i18next')?.value === 'fr' ? 'fr' : 'en';
};

// Keeps the chosen language on links between the two legal pages
export const legalHref = (lang: LegalLang, url: string, hash = '') =>
  `${url}${lang === 'fr' ? '?lang=fr' : ''}${hash}`;

// A missing business detail or a fact still to be confirmed by the operator
export const Todo = ({ id }: { id: string }) => (
  <mark className="rounded-[4px] bg-[#C9A753]/15 px-[6px] py-[1px] text-[#E5C97A] ring-1 ring-[#C9A753]/40">
    [{id}]
  </mark>
);

export const Detail = ({ value, id }: { value: string; id: string }) =>
  value ? <>{value}</> : <Todo id={id} />;

export const ContactEmail = () => (
  <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
);

// "<name>, an individual, under the trading name Maison Tayra"
export const OperatorName = ({ lang }: { lang: LegalLang }) =>
  lang === 'fr' ? (
    <>
      <Detail value={LEGAL.operatorName} id="OPERATOR_LEGAL_NAME_TO_CONFIRM" />,
      personne physique, sous le nom commercial {LEGAL.tradingName}
    </>
  ) : (
    <>
      <Detail value={LEGAL.operatorName} id="OPERATOR_LEGAL_NAME_TO_CONFIRM" />,
      an individual, under the trading name {LEGAL.tradingName}
    </>
  );

// The operator's identity, shown in the contact section of both pages
export const OperatorDetails = ({ lang }: { lang: LegalLang }) => {
  const fr = lang === 'fr';
  return (
    <ul>
      <li>
        {fr ? 'Exploitant' : 'Operator'}:{' '}
        <Detail
          value={LEGAL.operatorName}
          id="OPERATOR_LEGAL_NAME_TO_CONFIRM"
        />{' '}
        {fr
          ? '(personne physique, pas une société)'
          : '(individual, not a company)'}
      </li>
      <li>
        {fr ? 'Nom commercial' : 'Trading name'}: {LEGAL.tradingName}
      </li>
      <li>
        {fr ? 'Adresse' : 'Address'}:{' '}
        <Detail value={LEGAL.address} id="OPERATOR_ADDRESS_TO_CONFIRM" />
      </li>
      <li>
        {fr ? 'Registre du commerce (RC)' : 'Trade register (RC)'}:{' '}
        <Detail value={LEGAL.rc} id="RC_NUMBER_IF_APPLICABLE" />
      </li>
      <li>
        ICE: <Detail value={LEGAL.ice} id="ICE_NUMBER_IF_APPLICABLE" />
      </li>
      <li>
        {fr ? 'Identifiant fiscal (IF)' : 'Tax identifier (IF)'}:{' '}
        <Detail value={LEGAL.taxId} id="IF_NUMBER_IF_APPLICABLE" />
      </li>
      <li>
        {fr ? 'E-mail' : 'Email'}: <ContactEmail />
      </li>
      <li>
        {fr ? 'Téléphone' : 'Phone'}:{' '}
        <Detail value={LEGAL.phone} id="SUPPORT_PHONE_TO_CONFIRM" />
      </li>
    </ul>
  );
};

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface LegalDocument {
  title: string;
  description: string;
  intro: ReactNode;
  sections: LegalSection[];
}

const UI = {
  en: {
    contents: 'Contents',
    updated: 'Last updated:',
    terms: 'Terms',
    privacy: 'Privacy',
    signIn: 'Sign in',
    draft:
      'Draft: information shown in brackets, such as [OPERATOR_LEGAL_NAME_TO_CONFIRM], is still being confirmed.',
  },
  fr: {
    contents: 'Sommaire',
    updated: 'Dernière mise à jour :',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    signIn: 'Connexion',
    draft:
      'Version provisoire : les informations entre crochets, comme [OPERATOR_LEGAL_NAME_TO_CONFIRM], sont en cours de confirmation.',
  },
};

const LANGUAGES: { lang: LegalLang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'fr', label: 'Français' },
];

// Public page (no login, see proxy.ts) in the colours of the sign-in pages
export const LegalPage = ({
  lang,
  path,
  document: { title, intro, sections },
}: {
  lang: LegalLang;
  path: string;
  document: LegalDocument;
}) => {
  const linkClass = 'hover:text-white transition-colors';
  const ui = UI[lang];
  return (
    // lbox: the text is English or French only, while ChangeDir flips the
    // document to RTL for Arabic and Hebrew interfaces. global.scss forces
    // [dir='ltr'] back to RTL there, so dir="ltr" cannot be used; .lbox keeps
    // the page LTR.
    <div
      lang={lang}
      className="lbox min-h-screen w-full bg-[#111820] text-[#C3CCD8]"
    >
      <header className="border-b border-white/10 bg-[#18222E]">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-[12px] px-[20px] py-[16px]">
          <Link href="/" aria-label="Tayra Social">
            <LogoTextComponent />
          </Link>
          <nav className="flex gap-[20px] text-[14px]">
            <Link href={legalHref(lang, TERMS_URL)} className={linkClass}>
              {ui.terms}
            </Link>
            <Link href={legalHref(lang, PRIVACY_URL)} className={linkClass}>
              {ui.privacy}
            </Link>
            <Link href="/auth/login" className={linkClass}>
              {ui.signIn}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-[20px] py-[40px] lg:py-[56px]">
        <nav
          aria-label="Language"
          className="mb-[24px] flex gap-[8px] text-[13px]"
        >
          {LANGUAGES.map((l) => (
            <a
              key={l.lang}
              href={`${path}?lang=${l.lang}`}
              hrefLang={l.lang}
              aria-current={l.lang === lang ? 'true' : undefined}
              className={
                l.lang === lang
                  ? 'rounded-full bg-[#C9A753] px-[12px] py-[4px] font-[600] text-[#111820]'
                  : 'rounded-full px-[12px] py-[4px] ring-1 ring-white/15 hover:text-white'
              }
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mb-[16px] h-[3px] w-[48px] rounded-full bg-[#C9A753]" />
        <h1 className="text-[32px] font-[700] leading-[1.2] tracking-[-0.5px] text-white lg:text-[40px]">
          {title}
        </h1>
        <p className="mt-[8px] text-[14px]">
          {ui.updated} {LEGAL.lastUpdated[lang]}
        </p>
        {LEGAL.draft && (
          <p className="mt-[16px] max-w-[760px] rounded-[8px] bg-[#C9A753]/10 px-[14px] py-[10px] text-[14px] text-[#E5C97A] ring-1 ring-[#C9A753]/30">
            {ui.draft}
          </p>
        )}
        <div className="mt-[20px] max-w-[760px] text-[16px] leading-[1.7] [&_a]:text-[#E5C97A] [&_a]:underline [&_a]:underline-offset-2">
          {intro}
        </div>

        <div className="mt-[40px] flex flex-col gap-[40px] lg:flex-row">
          <nav
            aria-label={ui.contents}
            className="lg:sticky lg:top-[24px] lg:w-[260px] lg:shrink-0 lg:self-start"
          >
            <div className="rounded-[12px] bg-[#18222E] p-[20px]">
              <div className="mb-[12px] text-[12px] font-[600] uppercase tracking-[1px] text-[#C9A753]">
                {ui.contents}
              </div>
              <ol className="flex flex-col gap-[8px] text-[14px]">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={linkClass}>
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="min-w-0 max-w-[760px] flex-1 text-[16px] leading-[1.7] [&_a]:text-[#E5C97A] [&_a]:underline [&_a]:underline-offset-2 [&_h3]:mb-[8px] [&_h3]:mt-[20px] [&_h3]:text-[17px] [&_h3]:font-[600] [&_h3]:text-white [&_li]:mb-[6px] [&_ol]:mb-[14px] [&_ol]:list-decimal [&_ol]:ps-[22px] [&_p]:mb-[14px] [&_strong]:text-white [&_table]:mb-[16px] [&_table]:w-full [&_table]:text-[14px] [&_td]:border-t [&_td]:border-white/10 [&_td]:py-[8px] [&_td]:pe-[12px] [&_td]:align-top [&_th]:pb-[8px] [&_th]:pe-[12px] [&_th]:text-start [&_th]:font-[600] [&_th]:text-white [&_ul]:mb-[14px] [&_ul]:list-disc [&_ul]:ps-[22px]">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-[24px] border-t border-white/10 pt-[28px] pb-[12px] first:border-t-0 first:pt-0"
              >
                <h2 className="mb-[14px] text-[22px] font-[700] text-white">
                  {index + 1}. {section.title}
                </h2>
                {section.body}
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#18222E]">
        <SourceCodeNotice className="mx-auto max-w-[1120px] px-[20px] py-[24px]" />
      </footer>
    </div>
  );
};
