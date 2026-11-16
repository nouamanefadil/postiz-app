'use client';

// Tayra Social mark. Placeholder asset: replace public/tayra-mark.svg
// with the final logo (same file name) and every screen picks it up.
export const Logo = () => {
  return (
    <div className="mt-[8px] min-w-[60px] min-h-[60px] w-[60px] h-[60px] flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tayra-mark.svg"
        width={44}
        height={44}
        alt="Tayra Social"
      />
    </div>
  );
};
