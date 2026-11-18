import { ReactNode } from 'react';
import Link from 'next/link';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { SourceCodeNotice } from '@gitroom/frontend/components/layout/source.code.notice';
import { PRIVACY_URL, TERMS_URL } from '@gitroom/helpers/utils/brand';

// Tayra Social: the business details the Terms and the Privacy Policy need.
// Every empty value is shown on the pages as a highlighted "To complete"
// placeholder, so nothing is published as if it were known. Fill them in here.
export const LEGAL = {
  // Legal name (and legal form) of the business that runs Tayra Social
  operator: '',
  // Registered address of that business
  address: '',
  // Email address for privacy, deletion and support requests
  contactEmail: '',
  // Law that governs the Terms, and the competent courts
  governingLaw: '',
  // Country of the Hostinger data centre that hosts the server
  hostingLocation: '',
  lastUpdated: '18 November 2026',
};

// A missing business detail or a fact still to be confirmed by the operator
export const Todo = ({ children }: { children: ReactNode }) => (
  <mark className="rounded-[4px] bg-[#C9A753]/15 px-[6px] py-[1px] text-[#E5C97A] ring-1 ring-[#C9A753]/40">
    [To complete: {children}]
  </mark>
);

export const Detail = ({ value, label }: { value: string; label: string }) =>
  value ? <>{value}</> : <Todo>{label}</Todo>;

export const ContactEmail = () =>
  LEGAL.contactEmail ? (
    <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
  ) : (
    <Todo>contact email address</Todo>
  );

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

// Public page (no login, see proxy.ts) in the colours of the sign-in pages
export const LegalPage = ({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) => {
  const linkClass = 'hover:text-white transition-colors';
  return (
    // lbox: the text is English only, while ChangeDir flips the document to RTL
    // for Arabic and Hebrew interfaces. global.scss forces [dir='ltr'] back to
    // RTL there, so dir="ltr" cannot be used; .lbox keeps the page LTR.
    <div className="lbox min-h-screen w-full bg-[#111820] text-[#C3CCD8]">
      <header className="border-b border-white/10 bg-[#18222E]">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-[12px] px-[20px] py-[16px]">
          <Link href="/" aria-label="Tayra Social">
            <LogoTextComponent />
          </Link>
          <nav className="flex gap-[20px] text-[14px]">
            <Link href={TERMS_URL} className={linkClass}>
              Terms
            </Link>
            <Link href={PRIVACY_URL} className={linkClass}>
              Privacy
            </Link>
            <Link href="/auth/login" className={linkClass}>
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-[20px] py-[40px] lg:py-[56px]">
        <div className="mb-[16px] h-[3px] w-[48px] rounded-full bg-[#C9A753]" />
        <h1 className="text-[32px] font-[700] leading-[1.2] tracking-[-0.5px] text-white lg:text-[40px]">
          {title}
        </h1>
        <p className="mt-[8px] text-[14px]">
          Last updated: {LEGAL.lastUpdated}
        </p>
        <div className="mt-[20px] max-w-[760px] text-[16px] leading-[1.7]">
          {intro}
        </div>

        <div className="mt-[40px] flex flex-col gap-[40px] lg:flex-row">
          <nav
            aria-label="Contents"
            className="lg:sticky lg:top-[24px] lg:w-[260px] lg:shrink-0 lg:self-start"
          >
            <div className="rounded-[12px] bg-[#18222E] p-[20px]">
              <div className="mb-[12px] text-[12px] font-[600] uppercase tracking-[1px] text-[#C9A753]">
                Contents
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
