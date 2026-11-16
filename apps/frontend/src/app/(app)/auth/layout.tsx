import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { AttributionComponent } from '@gitroom/frontend/components/auth/attribution.component';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Toaster } from '@gitroom/react/toaster/toaster';
import { SourceCodeNotice } from '@gitroom/frontend/components/layout/source.code.notice';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));

// Tayra Social: brand panel with truthful product statements only (no user
// counts, ratings or testimonials).
const Feature = ({ title, text }: { title: string; text: string }) => (
  <li className="flex gap-[14px]">
    <span className="mt-[3px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#C9A753]/60 text-[#C9A753]">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2.5 6.2 4.9 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span>
      <span className="block text-[16px] font-[600] text-white">{title}</span>
      <span className="block text-[14px] leading-[1.55] text-[#C3CCD8]">{text}</span>
    </span>
  </li>
);

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <MantineWrapper>
      <Toaster />
      <div className="bg-[#111820] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
        <ReturnUrlComponent />
        <AttributionComponent />
        <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#18222E]">
          <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
            <LogoTextComponent />
            <div className="flex">{children}</div>
          </div>
          <SourceCodeNotice className="w-full max-w-[440px] mx-auto mt-[24px] text-center" />
        </div>
        <div className="relative hidden lg:flex flex-1 flex-col justify-center overflow-hidden rounded-[12px] bg-[#213651] px-[64px] py-[56px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-[180px] -end-[160px] h-[460px] w-[460px] rounded-full bg-[#C9A753] opacity-[0.10] blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 start-[64px] end-[64px] h-px bg-gradient-to-r from-transparent via-[#C9A753]/40 to-transparent"
          />
          <div className="relative max-w-[560px]">
            <div className="mb-[20px] h-[3px] w-[48px] rounded-full bg-[#C9A753]" />
            <h1 className="text-[40px] font-[700] leading-[1.15] tracking-[-0.5px]">
              {t('tayra_auth_headline', 'Grow Your Social Presence with Tayra Social')}
            </h1>
            <p className="mt-[16px] text-[18px] leading-[1.6] text-[#C3CCD8]">
              {t(
                'tayra_auth_subtitle',
                'Plan, schedule and manage all your social media accounts from one powerful workspace.'
              )}
            </p>
            <ul className="mt-[40px] flex flex-col gap-[22px]">
              <Feature
                title={t('tayra_feature_schedule_title', 'One calendar for every channel')}
                text={t(
                  'tayra_feature_schedule_text',
                  'Plan and schedule posts for all your connected social accounts in one place.'
                )}
              />
              <Feature
                title={t('tayra_feature_preview_title', 'See it before it goes live')}
                text={t(
                  'tayra_feature_preview_text',
                  'Preview each post the way it will appear on the platform you publish it to.'
                )}
              />
              <Feature
                title={t('tayra_feature_analytics_title', 'Know what works')}
                text={t(
                  'tayra_feature_analytics_text',
                  'Follow the performance of your channels and posts with built-in analytics.'
                )}
              />
              <Feature
                title={t('tayra_feature_team_title', 'Work as a team')}
                text={t(
                  'tayra_feature_team_text',
                  'Invite teammates and manage your brands together in a shared workspace.'
                )}
              />
            </ul>
          </div>
        </div>
      </div>
    </MantineWrapper>
  );
}
