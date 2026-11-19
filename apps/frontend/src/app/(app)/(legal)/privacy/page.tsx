import { Metadata } from 'next';
import {
  LegalPage,
  legalLang,
} from '@gitroom/frontend/components/legal/legal.page';
import { privacyContent } from '@gitroom/frontend/components/legal/privacy.content';
import { PRIVACY_URL } from '@gitroom/helpers/utils/brand';

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { title, description } =
    privacyContent[await legalLang(props.searchParams)];
  return { title: `${title} | Tayra Social`, description };
}

export default async function PrivacyPage(props: Props) {
  const lang = await legalLang(props.searchParams);
  return (
    <LegalPage lang={lang} path={PRIVACY_URL} document={privacyContent[lang]} />
  );
}
