// Tayra Social branding: the one place for the product name and the AGPL-3.0
// source link (see deploy/AGPL-COMPLIANCE.md). Tayra Social is a modified
// version of Postiz; upstream copyright and license notices stay untouched.
export const BRAND_NAME = 'Tayra Social';
export const SOURCE_REPOSITORY = 'https://github.com/nouamanefadil/postiz-app';
export const UPSTREAM_NAME = 'Postiz';
export const UPSTREAM_REPOSITORY = 'https://github.com/gitroomhq/postiz-app';

// Tayra Social's own legal pages (apps/frontend/src/app/(app)/(legal), public
// in proxy.ts). The registration form hides the "you agree to our Terms /
// Privacy" line while either is empty.
export const TERMS_URL: string = '/terms';
export const PRIVACY_URL: string = '/privacy';

// The image is built with NEXT_PUBLIC_VERSION = `git describe --tags --always`
// of the deployed commit: "v2.26.0-9-gc22451b8", a bare tag "v2.26.0", or a
// short sha "0efacc05". Link to that exact source; the repository otherwise.
export const sourceCodeUrl = (version = process.env.NEXT_PUBLIC_VERSION) => {
  const ref =
    version?.match(/-g([0-9a-f]{7,40})$/)?.[1] ||
    version?.match(/^[0-9a-f]{7,40}$/)?.[0] ||
    version?.match(/^v\d+\.\d+\.\d+$/)?.[0];
  return ref ? `${SOURCE_REPOSITORY}/tree/${ref}` : SOURCE_REPOSITORY;
};
