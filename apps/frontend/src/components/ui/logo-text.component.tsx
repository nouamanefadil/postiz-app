import React from 'react';
import { BRAND_NAME } from '@gitroom/helpers/utils/brand';

// Tayra Social wordmark: the mark (replaceable asset public/tayra-mark.svg)
// plus the name as text, so it follows the dark/light theme.
export const LogoTextComponent = () => {
  return (
    <div className="flex items-center gap-[10px] select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tayra-mark.svg" width={33} height={33} alt="" />
      <span className="text-[20px] font-[700] tracking-[-0.2px] text-newTextColor">
        {BRAND_NAME.split(' ')[0]}{' '}
        <span className="font-[600] text-[var(--new-accent-text)]">
          {BRAND_NAME.split(' ').slice(1).join(' ')}
        </span>
      </span>
    </div>
  );
};
