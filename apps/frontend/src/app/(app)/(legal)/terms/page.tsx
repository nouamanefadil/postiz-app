import { Metadata } from 'next';
import {
  LegalPage,
  legalLang,
} from '@gitroom/frontend/components/legal/legal.page';
import { termsContent } from '@gitroom/frontend/components/legal/terms.content';
import { TERMS_URL } from '@gitroom/helpers/utils/brand';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { title, description } =
    termsContent[await legalLang(props.searchParams)];
  return { title: `${title} | Tayra Social`, description };
}

export default async function TermsPage(props: Props) {
  const lang = await legalLang(props.searchParams);
  return (
    <LegalPage lang={lang} path={TERMS_URL} document={termsContent[lang]} />
  );
}
