# Legal pages: information still needed

The Terms of Service (`/terms`) and the Privacy Policy (`/privacy`), in English and
French (`?lang=en` / `?lang=fr`), show every unconfirmed fact as a highlighted
`[TOKEN]`. While `LEGAL.draft` is `true` a "Draft" notice is shown at the top of both
pages. The pages are **not** legally reviewed and must not be presented as approved
or compliant until the items below are resolved and the CNDP formalities verified.

Where to fill things in:

- **A. Operator details**: the `LEGAL` object in
  `apps/frontend/src/components/legal/legal.page.tsx`. A filled value replaces the
  token everywhere, in both languages.
- **B. Decisions inside the text**: the `<Todo id="..." />` tokens in
  `apps/frontend/src/components/legal/privacy.content.tsx`. Replace each token with
  the confirmed wording, in the `en` **and** `fr` versions.

## Confirmed (already in the pages)

| Fact | Value | Source |
| --- | --- | --- |
| Product name | Tayra Social | Operator |
| Operator | An individual (natural person), not a company | Operator |
| Trading name | Maison Tayra (a trading name, not a legal entity) | Operator |
| Contact email | maisontayra@gmail.com (support handled manually, Gmail) | Operator |
| Governing law | Morocco | Operator |
| Data protection law | Moroccan Law No. 09-08 | Operator |
| Email sending | None: no email provider configured, no automatic emails | Production audit (2026-11-19) |
| AI features | None: no AI provider configured | Production audit |
| Token encryption | Off: tokens stored without application-level encryption | Production audit |
| Sign-in | Email and password only (Google / GitHub not configured) | Production audit |
| Backups | Pre-deployment only, 7 most recent kept, no time limit | Repository (`deploy/vps/backup.sh`) + production |
| Proxy logs | Weekly rotation: access logs ~5 weeks, error logs ~11 weeks | Production (Nginx Proxy Manager logrotate) |
| Application logs | Removed when the container is recreated (each deploy) | Production |
| Automatic purge | None: deleted data stays until erased manually | Code audit |

## A. Operator details (`LEGAL` in legal.page.tsx)

| # | Token | Field | What to provide |
| --- | --- | --- | --- |
| 1 | `[OPERATOR_LEGAL_NAME_TO_CONFIRM]` | `operatorName` | Full legal name of the individual who operates Tayra Social |
| 2 | `[OPERATOR_ADDRESS_TO_CONFIRM]` | `address` | Business address of the operator |
| 3 | `[RC_NUMBER_IF_APPLICABLE]` | `rc` | Only if the operator is registered (e.g. as an individual trader). If not applicable, remove the line from `OperatorDetails` |
| 4 | `[ICE_NUMBER_IF_APPLICABLE]` | `ice` | Only if the operator has an ICE (e.g. auto-entrepreneur status). Otherwise remove the line |
| 5 | `[IF_NUMBER_IF_APPLICABLE]` | `taxId` | Only if the operator has a tax identifier for this activity. Otherwise remove the line |
| 6 | `[SUPPORT_PHONE_TO_CONFIRM]` | `phone` | Support phone number, or decide to remove the phone lines |
| 7 | `[HOSTING_LOCATION_TO_VERIFY]` | `hostingLocation` | Country (and city) of the Hostinger data centre: hPanel › VPS › Overview (the Hostinger API token in use does not list this VPS). English and French share this value |
| 8 | `[CNDP_FORMALITIES_TO_VERIFY]` | `cndp` | Reference of the CNDP declaration or authorisation (receipt number and date) once obtained. Do not fill in before the formality is done |
| 9 | `[COMPETENT_COURT_TO_CONFIRM]` | `court` | Competent courts for disputes, to choose with a lawyer |

Set `draft: false` and update `lastUpdated` only when all items are resolved.

## B. Decisions inside the text (privacy.content.tsx)

| # | Token | Where | What to decide |
| --- | --- | --- | --- |
| 10 | `[DATA_RETENTION_PERIOD_TO_CONFIRM]` | "Retention and deletion", 1st bullet | Maximum time before deleted posts, media, channels and accounts are erased automatically. Needs a purge job first; until then, keep the text that says nothing is purged automatically |
| 11 | `[DATA_RETENTION_PERIOD_TO_CONFIRM]` | "Retention and deletion", backups bullet | Maximum age of pre-deployment backups (today only the "7 most recent" rule applies, with no time limit) |
| 12 | `[DATA_RETENTION_PERIOD_TO_CONFIRM]` | "Retention and deletion", support emails bullet | How long support emails are kept in the Gmail mailbox |
| 13 | `[CNDP_FORMALITIES_TO_VERIFY]` | "International data transfers" | How transfers outside Morocco (Hostinger data centre if abroad, Cloudflare, Google, Meta, TikTok) are covered under Law 09-08 |

## C. Points for legal review

- CNDP: whether a **declaration or an authorisation** is required for this processing
  (Law 09-08), and filing it; the notice should then carry the CNDP receipt reference
  (item 8).
- **Transfers abroad** (item 13), including Google (Gmail) for support emails.
- The **legal bases** stated for each purpose and the description of data-subject
  rights (information, access, rectification, opposition) against Law 09-08.
- Whether the description of account deletion as **pseudonymisation** (MD5) and the
  list of data kept after deletion are sufficient, or whether the deletion process
  must change before publication.
- Whether a **liability cap** should be added to the Terms (none is stated; none was
  confirmed), and the wording of the disclaimer under Moroccan law.
- **Competent courts** and any mandatory mediation step (item 9).
- Whether the English or the French version prevails in case of conflict (the Terms
  currently say both have the same meaning).
- Response time for data-subject requests (the policy refers to the time limits of
  the applicable law).
- Whether an individual operator must publish identifiers such as ICE / IF
  (items 3-5).
