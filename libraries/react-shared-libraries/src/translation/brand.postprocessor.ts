import type { PostProcessorModule } from 'i18next';
import { BRAND_NAME } from '@gitroom/helpers/utils/brand';

// Tayra Social: renames the product in every translated string (all locales,
// and the inline English defaults passed to t()), at one point instead of
// editing the 16 upstream locale files. These keys name real Postiz products
// users must find under that name (CLI, n8n node, official connector, HubSpot
// app, browser extension), so they keep "Postiz".
const KEEP_POSTIZ = new Set([
  'check_n8n',
  'cli_description',
  'cli_onboarding_description',
  'chat_onboarding_description',
  'connector_onboarding_description',
  'connector_self_hosted_description',
  'hubspot_installed',
  'hubspot_installed_description',
  'extension_not_available',
  'extension_not_installed',
]);

export const brandPostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'tayraBrand',
  process(value, key) {
    const k = Array.isArray(key) ? key[0] : key;
    if (typeof value !== 'string' || KEEP_POSTIZ.has(k)) {
      return value;
    }
    return value.replace(/Postiz|Gitroom/g, BRAND_NAME);
  },
};
