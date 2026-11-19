# Legal pages: information still needed

The Terms of Service (`/terms`) and the Privacy Policy (`/privacy`), in English and
French (`?lang=en` / `?lang=fr`), show every unconfirmed fact as a highlighted
`[TOKEN]`. While `LEGAL.draft` is `true` a "Draft" notice is shown at the top of both
pages. The pages are **not** legally reviewed and must not be presented as approved
or compliant until the items below are resolved and the CNDP formalities verified.

Where to fill things in:

- **A. Business details**: the `LEGAL` object in
  `apps/frontend/src/components/legal/legal.page.tsx`. A filled value replaces the
  token everywhere, in both languages.
- **B. Facts inside the text**: the `<Todo id="..." />` tokens in
  `apps/frontend/src/components/legal/privacy.content.tsx` (and `terms.content.tsx`).
  Replace each token with the confirmed wording, in the `en` **and** `fr` versions.

## Confirmed (already in the pages)

| Fact | Value | Source |
| --- | --- | --- |
| Product name | Tayra Social | Operator |
| Trading name | Maison Tayra (not assumed to be the registered entity) | Operator |
| Contact email | maisontayra@gmail.com | Operator |
| Governing law | Morocco | Operator |
| Data protection law | Moroccan Law No. 09-08 | Operator |

## A. Business details (`LEGAL` in legal.page.tsx)

| # | Token | Field | What to provide |
| --- | --- | --- | --- |
| 1 | `[LEGAL_ENTITY_NAME_TO_CONFIRM]` | `legalEntity` | Registered legal name of the business that runs Tayra Social (or the name of the individual entrepreneur) |
| 2 | `[LEGAL_FORM_TO_CONFIRM]` | `legalForm` | Legal form (e.g. SARL, SARL AU, auto-entrepreneur, sole trader) |
| 3 | `[LEGAL_BUSINESS_ADDRESS_TO_CONFIRM]` | `address` | Registered or business address |
| 4 | `[RC_NUMBER_IF_APPLICABLE]` | `rc` | Registre du commerce number and city, if registered |
| 5 | `[ICE_NUMBER_IF_APPLICABLE]` | `ice` | Identifiant commun de l'entreprise, if applicable |
| 6 | `[IF_NUMBER_IF_APPLICABLE]` | `taxId` | Identifiant fiscal, if applicable |
| 7 | `[SUPPORT_PHONE_TO_CONFIRM]` | `phone` | Support phone number, or decide to remove the phone line |
| 8 | `[HOSTING_LOCATION_TO_VERIFY]` | `hostingLocation` | Country (and city) of the Hostinger data centre: hPanel › VPS › Overview. English and French share this value; if the country name differs between languages, edit the two sentences instead |
| 9 | `[CNDP_FORMALITIES_TO_VERIFY]` | `cndp` | Reference of the CNDP declaration or authorisation (récépissé number and date) once obtained. Do not fill in before the formality is done |
| 10 | `[COMPETENT_COURT_TO_CONFIRM]` | `court` | Competent courts for disputes (e.g. "the competent courts of Casablanca"), to choose with a lawyer |

Set `draft: false` and update `lastUpdated` only when all items are resolved.

## B. Facts inside the page text (privacy.content.tsx)

| # | Token | Where | What to confirm |
| --- | --- | --- | --- |
| 11 | `[EMAIL_PROVIDER_TO_CONFIRM]` | Recipients table | Which service sends the account and notification emails (the `EMAIL_PROVIDER` configured on the server: the software supports Resend, Amazon SES or an SMTP server), or remove the row if no email is sent |
| 12 | `[AI_PROVIDER_TO_CONFIRM]` | "AI features" and Recipients table | Whether the AI assistant / AI generation is enabled in production (`OPENAI_API_KEY` or other provider set), and which provider. If disabled, remove the "AI features" paragraph and the table row |
| 13 | `[TOKEN_ENCRYPTION_AT_REST_TO_CONFIRM]` | "How access tokens are handled" | Whether `ENCRYPTION_PROVIDER` is set on the server (the software then encrypts stored tokens with AES-256-GCM). If it is not set, write that tokens are protected by server access controls, or enable the encryption first |
| 14 | `[DATA_RETENTION_PERIOD_TO_CONFIRM]` | "Retention and deletion" (3 places) | Your retention policy for: (a) deleted posts, media and channels (today they stay until erased on request); (b) server and application logs (no Docker log rotation is set in the repository's compose files; check the VPS); (c) support emails |
| 15 | `[CNDP_FORMALITIES_TO_VERIFY]` | "International data transfers" | How transfers outside Morocco (Hostinger data centre if abroad, Cloudflare, Meta, TikTok) are covered under Law 09-08: adequate-protection country, consent, or CNDP authorisation |

## C. Findings from the code audit (no page change needed, but worth deciding)

- Sign-in with **Google** and **GitHub** is not configured in production (the login
  buttons return an OAuth link with an empty `client_id`), so the policy says only
  email/password sign-in is enabled. The **Google button is still shown** on the
  sign-in page and does not work: hide it or configure it, then update the policy.
- Deleting a channel is a **soft delete**: its tokens stay in the database and are
  not revoked at the platform. Deleted posts and media also stay (files on disk).
  The policy says so; a purge job or token revocation would let you shorten the
  retention text.
- Tokens are encrypted at rest only when `ENCRYPTION_PROVIDER` is set (see item 13).
- There is **no self-service data export**; copies are provided on request by email.
- No analytics, advertising cookies or tracking pixel are active (public
  configuration: no GTM, Facebook pixel, Sentry, Stripe, reCAPTCHA; `billingEnabled`
  false; storage local).

## D. Legal matters for professional review

- CNDP: whether a **declaration or an authorisation** is required for this
  processing (Law 09-08), and filing it before relying on the policy; the notice
  should then carry the CNDP receipt reference (item 9).
- **Transfers abroad** (item 15): Law 09-08 restricts transfers to countries without
  adequate protection; confirm the basis for Hostinger (if outside Morocco),
  Cloudflare, Meta and TikTok.
- The **legal bases** stated for each purpose (contract, legitimate interest, legal
  obligation) and the description of data-subject rights (information, access,
  rectification, opposition) against the text of Law 09-08.
- Whether a **liability cap** should be added to the Terms (none is stated; none
  was confirmed), and the wording of the disclaimer under Moroccan law
  (Dahir des obligations et contrats, Law 31-08 on consumer protection).
- **Competent courts** and any mandatory mediation step (item 10).
- Whether the English or the French version prevails in case of conflict (the
  Terms currently say both have the same meaning).
- Response time for data-subject requests (the policy refers to the time limits of
  the applicable law instead of a fixed number of days).
