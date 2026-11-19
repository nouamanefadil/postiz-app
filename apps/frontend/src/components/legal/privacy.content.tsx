import {
  ContactEmail,
  Detail,
  LEGAL,
  LegalDocument,
  LegalLang,
  OperatorDetails,
  Todo,
  legalHref,
} from '@gitroom/frontend/components/legal/legal.page';
import { TERMS_URL } from '@gitroom/helpers/utils/brand';

// Tayra Social Privacy Policy, English and French. Both versions must say the
// same thing: change them together. Placeholders: deploy/LEGAL-CHECKLIST.md.

// The permissions each platform connection requests, as declared in the
// provider files of libraries/nestjs-libraries/src/integrations/social.
// Keep in sync when a provider's scopes change.
const permissions: {
  platform: Record<LegalLang, string>;
  scopes: string[];
  purpose: Record<LegalLang, string>;
}[] = [
  {
    platform: { en: 'Facebook Page', fr: 'Page Facebook' },
    scopes: [
      'pages_show_list',
      'business_management',
      'pages_manage_posts',
      'pages_manage_engagement',
      'pages_read_engagement',
      'read_insights',
    ],
    purpose: {
      en: 'List the Pages you manage so you can choose which to connect, publish posts to them, read and answer comments, and show Page and post analytics.',
      fr: 'Lister les Pages que vous gérez pour choisir celles à connecter, y publier, lire les commentaires et y répondre, et afficher les statistiques des Pages et des publications.',
    },
  },
  {
    platform: {
      en: 'Instagram (via Facebook Business, Meta Unified Login)',
      fr: 'Instagram (via Facebook Business, Meta Unified Login)',
    },
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
    ],
    purpose: {
      en: 'Read the profile of the Instagram professional accounts you select, publish posts, Reels, carousels and Stories, read and answer comments, and show account and post analytics.',
      fr: 'Lire le profil des comptes Instagram professionnels que vous sélectionnez, publier des publications, Reels, carrousels et Stories, lire les commentaires et y répondre, et afficher les statistiques du compte et des publications.',
    },
  },
  {
    platform: {
      en: 'Instagram (Instagram Login)',
      fr: 'Instagram (connexion Instagram)',
    },
    scopes: [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
    ],
    purpose: {
      en: 'Same purposes as above, for Instagram professional accounts connected directly with Instagram, without a Facebook Page.',
      fr: 'Mêmes finalités que ci-dessus, pour les comptes Instagram professionnels connectés directement avec Instagram, sans Page Facebook.',
    },
  },
  {
    platform: { en: 'TikTok', fr: 'TikTok' },
    scopes: [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.list',
      'video.upload',
      'video.publish',
    ],
    purpose: {
      en: 'Show your TikTok name, avatar and account statistics, upload and publish the videos and photos you schedule (or send them to your TikTok inbox if you choose), and show your published videos and their statistics.',
      fr: 'Afficher votre nom, votre avatar et les statistiques de votre compte TikTok, téléverser et publier les vidéos et photos que vous programmez (ou les envoyer dans votre boîte de réception TikTok si vous le choisissez), et afficher vos vidéos publiées et leurs statistiques.',
    },
  },
];

const cookies: {
  name: string;
  purpose: Record<LegalLang, string>;
  duration: Record<LegalLang, string>;
}[] = [
  {
    name: 'auth',
    purpose: {
      en: 'Keeps you signed in (HTTP-only, secure).',
      fr: 'Vous garde connecté (HTTP-only, sécurisé).',
    },
    duration: {
      en: '1 year, or until you sign out',
      fr: '1 an, ou jusqu’à la déconnexion',
    },
  },
  {
    name: 'showorg',
    purpose: {
      en: 'Remembers which workspace you are working in.',
      fr: 'Mémorise l’espace de travail dans lequel vous travaillez.',
    },
    duration: { en: '1 year', fr: '1 an' },
  },
  {
    name: 'org',
    purpose: {
      en: 'Carries a workspace invitation while you sign in.',
      fr: 'Conserve une invitation à un espace de travail pendant la connexion.',
    },
    duration: { en: '2 days', fr: '2 jours' },
  },
  {
    name: 'i18next',
    purpose: {
      en: 'Remembers the language of the interface.',
      fr: 'Mémorise la langue de l’interface.',
    },
    duration: { en: '7 days', fr: '7 jours' },
  },
  {
    name: 'oauth_state',
    purpose: {
      en: 'Protects sign-in with an external provider against forged requests.',
      fr: 'Protège la connexion via un fournisseur externe contre les requêtes falsifiées.',
    },
    duration: { en: '10 minutes', fr: '10 minutes' },
  },
  {
    name: 'impersonate',
    purpose: {
      en: 'Used only when an administrator opens an account to provide support.',
      fr: 'Utilisé uniquement lorsqu’un administrateur ouvre un compte pour fournir une assistance.',
    },
    duration: {
      en: 'Until the administrator ends it (at most 1 year)',
      fr: 'Jusqu’à ce que l’administrateur y mette fin (1 an au plus)',
    },
  },
];

const permissionsTable = (
  lang: LegalLang,
  headers: [string, string, string]
) => (
  <div className="overflow-x-auto">
    <table>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {permissions.map((p) => (
          <tr key={p.platform.en}>
            <td className="min-w-[140px] text-white">{p.platform[lang]}</td>
            <td className="min-w-[180px]">
              {p.scopes.map((scope) => (
                <code key={scope} className="block text-[13px]">
                  {scope}
                </code>
              ))}
            </td>
            <td className="min-w-[200px]">{p.purpose[lang]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const cookiesTable = (lang: LegalLang, headers: [string, string, string]) => (
  <div className="overflow-x-auto">
    <table>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cookies.map((c) => (
          <tr key={c.name}>
            <td>
              <code className="text-white">{c.name}</code>
            </td>
            <td>{c.purpose[lang]}</td>
            <td className="min-w-[110px]">{c.duration[lang]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const platformPolicies = (lang: LegalLang) => (
  <>
    <a
      href="https://www.facebook.com/privacy/policy"
      target="_blank"
      rel="noopener noreferrer"
    >
      {lang === 'fr'
        ? 'Politique de confidentialité de Meta'
        : 'Meta Privacy Policy'}
    </a>{' '}
    (Facebook, Instagram){lang === 'fr' ? ' et la ' : ' and the '}
    <a
      href="https://www.tiktok.com/legal/privacy-policy"
      target="_blank"
      rel="noopener noreferrer"
    >
      {lang === 'fr'
        ? 'Politique de confidentialité de TikTok'
        : 'TikTok Privacy Policy'}
    </a>
  </>
);

const CNDP_URL = 'https://www.cndp.ma';

const en: LegalDocument = {
  title: 'Privacy Policy',
  description:
    'How Tayra Social collects, uses, stores and deletes personal data and social media account data.',
  intro: (
    <p>
      This policy explains what information Tayra Social collects, why it is
      processed, how it is protected, how you can delete it, and how you can
      disconnect your social media accounts. It applies together with our{' '}
      <a href={TERMS_URL}>Terms of Service</a>.
    </p>
  ),
  sections: [
    {
      id: 'who-we-are',
      title: 'Who we are',
      body: (
        <>
          <p>
            Tayra Social, available at{' '}
            <a href="https://social.maisontayra.com">
              https://social.maisontayra.com
            </a>{' '}
            (the &quot;Service&quot;), is operated under the trading name{' '}
            {LEGAL.tradingName} by{' '}
            <Detail
              value={LEGAL.legalEntity}
              id="LEGAL_ENTITY_NAME_TO_CONFIRM"
            />{' '}
            (&quot;we&quot;, &quot;us&quot;). We decide why and how the personal
            data described in this policy is processed, and we are responsible
            for it.
          </p>
          <p>
            We process personal data in accordance with Moroccan Law No. 09-08
            on the protection of individuals with regard to the processing of
            personal data. Formalities with the Moroccan data protection
            authority (CNDP):{' '}
            <Detail value={LEGAL.cndp} id="CNDP_FORMALITIES_TO_VERIFY" />.
          </p>
          <p>
            Contact for privacy questions and requests: <ContactEmail />. Our
            full details are in the <a href="#contact">Contact</a> section.
          </p>
        </>
      ),
    },
    {
      id: 'information',
      title: 'Information we collect',
      body: (
        <>
          <h3>Account information</h3>
          <ul>
            <li>
              Email address, first name and, if you add them, last name, profile
              picture, bio and time zone.
            </li>
            <li>
              Your password, stored only as a one-way bcrypt hash. We cannot
              read it.
            </li>
            <li>
              The IP address and browser type (user agent) recorded when your
              account is created, and the time you were last active.
            </li>
            <li>Your email notification preferences.</li>
          </ul>
          <p>
            Sign-in is by email address and password. Sign-in with an external
            provider such as Google is not enabled.
          </p>
          <h3>Workspace information</h3>
          <p>
            Workspace name, members and their roles, invitations, API keys,
            webhook addresses, signatures, tags, RSS sources for automatic
            posting, keys of third-party tools you add, and the AI assistants
            and applications you authorise.
          </p>
          <h3>Connected social media accounts</h3>
          <p>
            For each account you connect: its identifier on the platform,
            display name, username, profile picture, the access token and
            refresh token issued by the platform, their expiry date, and your
            settings for that account (such as preferred posting times).
          </p>
          <h3>Your content</h3>
          <p>
            Posts (text, title, media, platform settings, schedule and status),
            the identifiers and links of published posts, error messages
            returned by platforms together with the content of the failed
            request, the images and videos you upload (with thumbnails and
            alternative text), images you create in the editor, and comments
            left on preview links, including the display name a commenter
            enters.
          </p>
          <h3>Data retrieved from the platforms</h3>
          <p>
            When you use these features, we retrieve from the platforms the list
            of pages or accounts you can connect, comments on your posts, and
            analytics such as followers, impressions, views, likes and comments.
            They are retrieved to show them to you and may be cached
            temporarily.
          </p>
          <h3>AI features</h3>
          <p>
            If you use the AI assistant, your messages and its answers are
            stored in our database so that you can continue the conversation,
            and they are sent to the AI provider that generates the answers:{' '}
            <Todo id="AI_PROVIDER_TO_CONFIRM" />.
          </p>
          <h3>Support requests</h3>
          <p>
            When you contact us, we receive your email address and the content
            of your message, and use them to answer you.
          </p>
          <h3>Technical information</h3>
          <p>
            Our reverse proxy and Cloudflare (see{' '}
            <a href="#sharing">Recipients and service providers</a>) process the
            IP address, browser type, requested address and time of each
            request. The application logs errors, which can include the error
            returned by a platform.
          </p>
        </>
      ),
    },
    {
      id: 'use',
      title: 'Why we process information',
      body: (
        <>
          <p>We use the information above only to:</p>
          <ul>
            <li>
              create your account, sign you in and keep it secure (performance
              of our contract with you);
            </li>
            <li>
              publish your posts at the time you chose and show their status
              (performance of our contract);
            </li>
            <li>
              show analytics and comments from your connected accounts, and keep
              your connections active by renewing their access (performance of
              our contract);
            </li>
            <li>
              send you the notifications you enabled, such as a post that failed
              (performance of our contract, according to your preferences);
            </li>
            <li>
              answer your requests and provide support (performance of our
              contract);
            </li>
            <li>
              prevent abuse, secure the Service and keep backups (our legitimate
              interest in a secure and reliable Service);
            </li>
            <li>meet our legal obligations.</li>
          </ul>
          <p>
            We do not sell personal data or platform data. We do not use it for
            advertising, profiling or to train AI models, and we do not share
            data received from the platforms with data brokers or advertising
            networks. Data from a platform is used only to provide the features
            you use with that platform.
          </p>
        </>
      ),
    },
    {
      id: 'platform-data',
      title: 'Social platform data and permissions',
      body: (
        <>
          <p>
            You choose which accounts to connect. Each platform shows you the
            permissions it grants before you approve them. The table below lists
            the permissions the Service requests and why. Some connections are
            available only once the platform has approved our application.
          </p>
          {permissionsTable('en', [
            'Connection',
            'Permissions',
            'Why we need them',
          ])}
          <p>
            The Service performs actions on a platform only when you ask for
            them, such as publishing a post you scheduled. The platforms process
            data under their own privacy policies: the {platformPolicies('en')}.
          </p>
        </>
      ),
    },
    {
      id: 'tokens',
      title: 'How access tokens are handled',
      body: (
        <ul>
          <li>
            Access tokens are issued by the platform after you approve the
            connection. We never receive your social media passwords.
          </li>
          <li>
            Tokens are stored in our database on the server that runs the
            Service, and are used only by the server to perform the actions you
            request and to renew the connection.
          </li>
          <li>
            Tokens are not shown in the interface. They are sent only to the
            platform that issued them, over encrypted HTTPS connections.
          </li>
          <li>
            Encryption of stored tokens:{' '}
            <Todo id="TOKEN_ENCRYPTION_AT_REST_TO_CONFIRM" />
          </li>
          <li>
            Revoking access on the platform makes the stored tokens unusable
            immediately (see <a href="#disconnect">Disconnecting accounts</a>).
          </li>
        </ul>
      ),
    },
    {
      id: 'security',
      title: 'Security',
      body: (
        <>
          <p>We protect personal data with measures that include:</p>
          <ul>
            <li>HTTPS encryption of all traffic to the Service;</li>
            <li>passwords stored only as bcrypt hashes;</li>
            <li>sign-in cookies that are HTTP-only and secure;</li>
            <li>access to the server restricted to our administrator;</li>
            <li>regular backups of the database.</li>
          </ul>
          <p>
            No system is completely secure, and we cannot guarantee absolute
            security. We do not claim any security certification. If we become
            aware of a breach that affects your data, we will inform you and the
            competent authorities where the law requires it.
          </p>
        </>
      ),
    },
    {
      id: 'sharing',
      title: 'Recipients and service providers',
      body: (
        <>
          <p>
            We share personal data only with the following providers, and only
            as needed to run the Service:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>What it does</th>
                  <th>Data involved</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="min-w-[120px] text-white">Hostinger</td>
                  <td>
                    Hosts the server (VPS) that runs the Service, its database
                    and the uploaded files.
                  </td>
                  <td>All data described in this policy</td>
                </tr>
                <tr>
                  <td className="text-white">Cloudflare</td>
                  <td>
                    Domain name service, HTTPS and network protection in front
                    of the Service.
                  </td>
                  <td>All traffic between your browser and the Service</td>
                </tr>
                <tr>
                  <td className="text-white">The platforms you connect</td>
                  <td>Meta (Facebook, Instagram) and TikTok.</td>
                  <td>
                    The content you publish and the requests made on your behalf
                  </td>
                </tr>
                <tr>
                  <td className="text-white">Polotno</td>
                  <td>
                    Supplies templates, stock images and fonts to the image
                    editor; your browser contacts it when you open the editor.
                  </td>
                  <td>Your IP address and browser request data</td>
                </tr>
                <tr>
                  <td className="text-white">
                    <Todo id="EMAIL_PROVIDER_TO_CONFIRM" />
                  </td>
                  <td>Sends account and notification emails.</td>
                  <td>Your email address and the email content</td>
                </tr>
                <tr>
                  <td className="text-white">
                    <Todo id="AI_PROVIDER_TO_CONFIRM" />
                  </td>
                  <td>Generates the answers of the AI assistant.</td>
                  <td>The messages you send to the AI assistant</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Data also leaves the Service when you ask for it: posts go to the
            platforms you select, webhooks send post information to the
            addresses you configure, and the API keys, AI assistants and
            applications you authorise can access your workspace.
          </p>
          <p>
            We may disclose information when required by law, or to protect the
            rights, safety and security of our users and the Service.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies and analytics',
      body: (
        <>
          <p>
            The Service uses only the cookies it needs to work. It does not use
            analytics, advertising or tracking cookies, and no tracking pixel is
            enabled.
          </p>
          {cookiesTable('en', ['Cookie', 'Purpose', 'Duration'])}
          <p>
            The Service also keeps interface preferences, and the page and
            referrer you arrived from, in your browser&apos;s local storage.
            They stay on your device and are not sent to us.
          </p>
        </>
      ),
    },
    {
      id: 'deletion',
      title: 'Retention and deletion',
      body: (
        <>
          <h3>How long we keep data</h3>
          <ul>
            <li>
              Your account, workspace, connected accounts and content: for as
              long as your account exists, unless you delete them earlier.
            </li>
            <li>
              Posts, media and channels that you delete are hidden from the
              Service immediately, but are kept in the database (and uploaded
              files on the server) until they are erased:{' '}
              <Todo id="DATA_RETENTION_PERIOD_TO_CONFIRM" />.
            </li>
            <li>
              Backups: before each update of the software we make a full backup
              of the database. The 7 most recent backups are kept on the server
              and older ones are deleted automatically.
            </li>
            <li>
              Server and application logs:{' '}
              <Todo id="DATA_RETENTION_PERIOD_TO_CONFIRM" />.
            </li>
            <li>
              Support emails: <Todo id="DATA_RETENTION_PERIOD_TO_CONFIRM" />.
            </li>
          </ul>
          <h3>Deleting your account</h3>
          <p>
            You can delete your account at any time in{' '}
            <strong>Settings › Delete your account</strong>. When you do:
          </p>
          <ul>
            <li>
              your email address, names and external sign-in identifier are
              replaced by irreversible hashes, and your password, bio, profile
              picture, IP address and browser type are removed;
            </li>
            <li>
              workspaces in which you are the only member are closed: their
              connected accounts&apos; tokens, names and profiles are replaced
              by irreversible hashes, so they can no longer be used, and their
              posts are marked as deleted;
            </li>
            <li>
              you are removed from workspaces you share with other members,
              which keep their content.
            </li>
          </ul>
          <p>
            To have all remaining data erased, including deleted posts and
            uploaded files, email us at <ContactEmail /> from the address of
            your account. We will confirm once the deletion is complete. Data in
            backups is removed when those backups are replaced.
          </p>
          <h3>Deleting data received from Facebook, Instagram or TikTok</h3>
          <p>
            To remove the data we hold about a connected Facebook, Instagram or
            TikTok account: delete the channel in Tayra Social (see the next
            section), remove Tayra Social&apos;s access in the platform&apos;s
            settings, and email <ContactEmail /> to have the stored data erased.
          </p>
        </>
      ),
    },
    {
      id: 'disconnect',
      title: 'Disconnecting accounts and revoking access',
      body: (
        <>
          <p>
            <strong>In Tayra Social:</strong> open the menu of the channel in
            the channel list and choose <strong>Delete</strong> (you can also
            choose <strong>Disable Channel</strong> to pause it). A deleted
            channel is no longer used for anything: nothing is published to it
            and no data is retrieved from it. Its stored tokens remain in our
            database until you delete your account or ask us to erase them.
          </p>
          <p>
            <strong>On the platform:</strong> revoking access makes the stored
            tokens unusable immediately. Menu names can vary between app
            versions.
          </p>
          <ul>
            <li>
              Facebook: Settings &amp; privacy › Settings › Business
              integrations (or Apps and websites), then remove Tayra Social.
            </li>
            <li>
              Instagram: Settings › Apps and websites (Website permissions),
              then remove Tayra Social.
            </li>
            <li>
              TikTok: Settings and privacy › Security › Manage app permissions,
              then remove Tayra Social.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your rights and how to exercise them',
      body: (
        <>
          <p>
            Under Moroccan Law No. 09-08, you have the right to be informed
            about the processing of your data, to access it, to have it
            corrected, completed, updated or erased, and to object to its
            processing on legitimate grounds. You can also:
          </p>
          <ul>
            <li>
              view and correct your profile information in the Service&apos;s
              settings;
            </li>
            <li>disconnect any social media account at any time;</li>
            <li>delete your account, as described above.</li>
          </ul>
          <p>
            To exercise your rights, email <ContactEmail /> from the address of
            your account, or include enough information for us to verify your
            identity. The Service has no self-service data export; we provide a
            copy of your data on request. We answer within the time limits set
            by the applicable law.
          </p>
          <p>
            If you believe your rights have not been respected, you can lodge a
            complaint with the Moroccan data protection authority, the CNDP (
            <a href={CNDP_URL} target="_blank" rel="noopener noreferrer">
              www.cndp.ma
            </a>
            ). Depending on where you live, other data protection laws may give
            you further rights.
          </p>
        </>
      ),
    },
    {
      id: 'transfers',
      title: 'International data transfers',
      body: (
        <>
          <p>
            The server that runs the Service is located in{' '}
            <Detail
              value={LEGAL.hostingLocation}
              id="HOSTING_LOCATION_TO_VERIFY"
            />
            . Cloudflare handles traffic through its global network, and the
            platforms you connect (Meta, TikTok) process data in the countries
            they operate in. Your data may therefore be transferred to and
            processed in countries other than Morocco.
          </p>
          <p>
            Transfers of personal data outside Morocco are made under the
            conditions of Law No. 09-08:{' '}
            <Todo id="CNDP_FORMALITIES_TO_VERIFY" />.
          </p>
        </>
      ),
    },
    {
      id: 'children',
      title: 'Children',
      body: (
        <p>
          The Service is intended for businesses and professionals and is not
          directed at children. We do not knowingly collect data from children.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: (
        <p>
          We may update this Privacy Policy. The date at the top of this page
          shows when it was last changed. If a change is significant, we will
          inform you in the Service or by email before it takes effect.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      body: (
        <>
          <p>
            For any question or request about your personal data, contact us at{' '}
            <ContactEmail />.
          </p>
          <OperatorDetails lang="en" />
        </>
      ),
    },
  ],
};

const fr: LegalDocument = {
  title: 'Politique de confidentialité',
  description:
    'Comment Tayra Social collecte, utilise, conserve et supprime les données personnelles et les données des comptes de réseaux sociaux.',
  intro: (
    <p>
      Cette politique explique quelles informations Tayra Social collecte,
      pourquoi elles sont traitées, comment elles sont protégées, comment vous
      pouvez les supprimer et comment déconnecter vos comptes de réseaux
      sociaux. Elle s&apos;applique avec nos{' '}
      <a href={legalHref('fr', TERMS_URL)}>
        Conditions générales d&apos;utilisation
      </a>
      .
    </p>
  ),
  sections: [
    {
      id: 'who-we-are',
      title: 'Qui sommes-nous',
      body: (
        <>
          <p>
            Tayra Social, disponible à l&apos;adresse{' '}
            <a href="https://social.maisontayra.com">
              https://social.maisontayra.com
            </a>{' '}
            (le « Service »), est exploité sous le nom commercial{' '}
            {LEGAL.tradingName} par{' '}
            <Detail
              value={LEGAL.legalEntity}
              id="LEGAL_ENTITY_NAME_TO_CONFIRM"
            />{' '}
            (« nous »). Nous déterminons les finalités et les moyens du
            traitement des données personnelles décrites dans cette politique et
            en sommes responsables.
          </p>
          <p>
            Nous traitons les données personnelles conformément à la loi
            marocaine n° 09-08 relative à la protection des personnes physiques
            à l&apos;égard du traitement des données à caractère personnel.
            Formalités auprès de la Commission nationale de contrôle de la
            protection des données à caractère personnel (CNDP) :{' '}
            <Detail value={LEGAL.cndp} id="CNDP_FORMALITIES_TO_VERIFY" />.
          </p>
          <p>
            Contact pour les questions et demandes relatives à la vie privée :{' '}
            <ContactEmail />. Nos coordonnées complètes figurent dans la section{' '}
            <a href="#contact">Contact</a>.
          </p>
        </>
      ),
    },
    {
      id: 'information',
      title: 'Informations collectées',
      body: (
        <>
          <h3>Informations du compte</h3>
          <ul>
            <li>
              Adresse e-mail, prénom et, si vous les ajoutez, nom, photo de
              profil, biographie et fuseau horaire.
            </li>
            <li>
              Votre mot de passe, conservé uniquement sous forme
              d&apos;empreinte bcrypt irréversible. Nous ne pouvons pas le lire.
            </li>
            <li>
              L&apos;adresse IP et le type de navigateur (user agent)
              enregistrés lors de la création de votre compte, ainsi que la date
              de votre dernière activité.
            </li>
            <li>Vos préférences de notifications par e-mail.</li>
          </ul>
          <p>
            La connexion se fait par adresse e-mail et mot de passe. La
            connexion via un fournisseur externe comme Google n&apos;est pas
            activée.
          </p>
          <h3>Informations de l&apos;espace de travail</h3>
          <p>
            Nom de l&apos;espace de travail, membres et rôles, invitations, clés
            d&apos;API, adresses de webhooks, signatures, étiquettes, sources
            RSS de publication automatique, clés des outils tiers que vous
            ajoutez, et assistants d&apos;IA et applications que vous autorisez.
          </p>
          <h3>Comptes de réseaux sociaux connectés</h3>
          <p>
            Pour chaque compte connecté : son identifiant sur la plateforme, son
            nom affiché, son nom d&apos;utilisateur, sa photo de profil, le
            jeton d&apos;accès et le jeton de renouvellement délivrés par la
            plateforme, leur date d&apos;expiration, et vos paramètres pour ce
            compte (comme les horaires de publication préférés).
          </p>
          <h3>Votre contenu</h3>
          <p>
            Les publications (texte, titre, médias, paramètres par plateforme,
            programmation et statut), les identifiants et liens des publications
            publiées, les messages d&apos;erreur renvoyés par les plateformes
            avec le contenu de la requête en échec, les images et vidéos que
            vous téléversez (avec miniatures et texte alternatif), les images
            créées dans l&apos;éditeur, et les commentaires laissés sur les
            liens d&apos;aperçu, y compris le nom saisi par leur auteur.
          </p>
          <h3>Données provenant des plateformes</h3>
          <p>
            Lorsque vous utilisez ces fonctionnalités, nous récupérons auprès
            des plateformes la liste des pages ou comptes que vous pouvez
            connecter, les commentaires sur vos publications et des statistiques
            comme les abonnés, impressions, vues, mentions « J&apos;aime » et
            commentaires. Elles sont récupérées pour vous être affichées et
            peuvent être mises en cache temporairement.
          </p>
          <h3>Fonctionnalités d&apos;IA</h3>
          <p>
            Si vous utilisez l&apos;assistant d&apos;IA, vos messages et ses
            réponses sont conservés dans notre base de données afin que vous
            puissiez poursuivre la conversation, et ils sont transmis au
            fournisseur d&apos;IA qui génère les réponses :{' '}
            <Todo id="AI_PROVIDER_TO_CONFIRM" />.
          </p>
          <h3>Demandes d&apos;assistance</h3>
          <p>
            Lorsque vous nous contactez, nous recevons votre adresse e-mail et
            le contenu de votre message, et les utilisons pour vous répondre.
          </p>
          <h3>Informations techniques</h3>
          <p>
            Notre proxy inverse et Cloudflare (voir{' '}
            <a href="#sharing">Destinataires et prestataires</a>) traitent
            l&apos;adresse IP, le type de navigateur, l&apos;adresse demandée et
            l&apos;heure de chaque requête. L&apos;application journalise les
            erreurs, qui peuvent inclure l&apos;erreur renvoyée par une
            plateforme.
          </p>
        </>
      ),
    },
    {
      id: 'use',
      title: 'Pourquoi nous traitons ces informations',
      body: (
        <>
          <p>Nous utilisons ces informations uniquement pour :</p>
          <ul>
            <li>
              créer votre compte, vous connecter et le sécuriser (exécution de
              notre contrat avec vous) ;
            </li>
            <li>
              publier vos publications au moment choisi et afficher leur statut
              (exécution de notre contrat) ;
            </li>
            <li>
              afficher les statistiques et commentaires de vos comptes connectés
              et maintenir vos connexions actives en renouvelant leur accès
              (exécution de notre contrat) ;
            </li>
            <li>
              vous envoyer les notifications que vous avez activées, par exemple
              en cas d&apos;échec d&apos;une publication (exécution de notre
              contrat, selon vos préférences) ;
            </li>
            <li>
              répondre à vos demandes et vous assister (exécution de notre
              contrat) ;
            </li>
            <li>
              prévenir les abus, sécuriser le Service et effectuer des
              sauvegardes (notre intérêt légitime à disposer d&apos;un Service
              sûr et fiable) ;
            </li>
            <li>respecter nos obligations légales.</li>
          </ul>
          <p>
            Nous ne vendons pas les données personnelles ni les données des
            plateformes. Nous ne les utilisons pas à des fins publicitaires, de
            profilage ou d&apos;entraînement de modèles d&apos;IA, et nous ne
            partageons pas les données reçues des plateformes avec des courtiers
            en données ou des réseaux publicitaires. Les données d&apos;une
            plateforme servent uniquement à fournir les fonctionnalités que vous
            utilisez avec cette plateforme.
          </p>
        </>
      ),
    },
    {
      id: 'platform-data',
      title: 'Données des plateformes et autorisations',
      body: (
        <>
          <p>
            Vous choisissez les comptes à connecter. Chaque plateforme vous
            présente les autorisations demandées avant que vous ne les
            approuviez. Le tableau ci-dessous indique les autorisations
            demandées par le Service et leur raison. Certaines connexions ne
            sont disponibles qu&apos;après l&apos;approbation de notre
            application par la plateforme.
          </p>
          {permissionsTable('fr', ['Connexion', 'Autorisations', 'Pourquoi'])}
          <p>
            Le Service n&apos;agit sur une plateforme qu&apos;à votre demande,
            par exemple pour publier une publication programmée. Les plateformes
            traitent les données selon leurs propres politiques : la{' '}
            {platformPolicies('fr')}.
          </p>
        </>
      ),
    },
    {
      id: 'tokens',
      title: 'Traitement des jetons d’accès',
      body: (
        <ul>
          <li>
            Les jetons d&apos;accès sont délivrés par la plateforme après votre
            approbation de la connexion. Nous ne recevons jamais vos mots de
            passe de réseaux sociaux.
          </li>
          <li>
            Les jetons sont conservés dans notre base de données sur le serveur
            qui fait fonctionner le Service, et ne sont utilisés que par ce
            serveur pour réaliser les actions que vous demandez et renouveler la
            connexion.
          </li>
          <li>
            Les jetons ne sont pas affichés dans l&apos;interface. Ils ne sont
            envoyés qu&apos;à la plateforme qui les a délivrés, via des
            connexions HTTPS chiffrées.
          </li>
          <li>
            Chiffrement des jetons conservés :{' '}
            <Todo id="TOKEN_ENCRYPTION_AT_REST_TO_CONFIRM" />
          </li>
          <li>
            La révocation de l&apos;accès sur la plateforme rend immédiatement
            les jetons conservés inutilisables (voir{' '}
            <a href="#disconnect">Déconnexion des comptes</a>).
          </li>
        </ul>
      ),
    },
    {
      id: 'security',
      title: 'Sécurité',
      body: (
        <>
          <p>
            Nous protégeons les données personnelles par des mesures qui
            comprennent :
          </p>
          <ul>
            <li>le chiffrement HTTPS de tout le trafic vers le Service ;</li>
            <li>
              des mots de passe conservés uniquement sous forme
              d&apos;empreintes bcrypt ;
            </li>
            <li>des cookies de connexion HTTP-only et sécurisés ;</li>
            <li>un accès au serveur réservé à notre administrateur ;</li>
            <li>des sauvegardes régulières de la base de données.</li>
          </ul>
          <p>
            Aucun système n&apos;est totalement sûr et nous ne pouvons pas
            garantir une sécurité absolue. Nous ne revendiquons aucune
            certification de sécurité. Si nous avons connaissance d&apos;une
            violation affectant vos données, nous vous en informerons, ainsi que
            les autorités compétentes lorsque la loi l&apos;exige.
          </p>
        </>
      ),
    },
    {
      id: 'sharing',
      title: 'Destinataires et prestataires',
      body: (
        <>
          <p>
            Nous ne partageons des données personnelles qu&apos;avec les
            prestataires suivants, et uniquement dans la mesure nécessaire au
            fonctionnement du Service :
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Prestataire</th>
                  <th>Rôle</th>
                  <th>Données concernées</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="min-w-[120px] text-white">Hostinger</td>
                  <td>
                    Héberge le serveur (VPS) qui fait fonctionner le Service, sa
                    base de données et les fichiers téléversés.
                  </td>
                  <td>Toutes les données décrites dans cette politique</td>
                </tr>
                <tr>
                  <td className="text-white">Cloudflare</td>
                  <td>
                    Service de noms de domaine, HTTPS et protection réseau en
                    amont du Service.
                  </td>
                  <td>Tout le trafic entre votre navigateur et le Service</td>
                </tr>
                <tr>
                  <td className="text-white">Les plateformes connectées</td>
                  <td>Meta (Facebook, Instagram) et TikTok.</td>
                  <td>
                    Le contenu que vous publiez et les requêtes effectuées en
                    votre nom
                  </td>
                </tr>
                <tr>
                  <td className="text-white">Polotno</td>
                  <td>
                    Fournit des modèles, images d&apos;illustration et polices à
                    l&apos;éditeur d&apos;images ; votre navigateur le contacte
                    à l&apos;ouverture de l&apos;éditeur.
                  </td>
                  <td>
                    Votre adresse IP et les données de requête du navigateur
                  </td>
                </tr>
                <tr>
                  <td className="text-white">
                    <Todo id="EMAIL_PROVIDER_TO_CONFIRM" />
                  </td>
                  <td>
                    Envoie les e-mails liés au compte et les notifications.
                  </td>
                  <td>Votre adresse e-mail et le contenu de l&apos;e-mail</td>
                </tr>
                <tr>
                  <td className="text-white">
                    <Todo id="AI_PROVIDER_TO_CONFIRM" />
                  </td>
                  <td>Génère les réponses de l&apos;assistant d&apos;IA.</td>
                  <td>Les messages que vous envoyez à l&apos;assistant</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Des données quittent aussi le Service à votre demande : les
            publications sont envoyées aux plateformes choisies, les webhooks
            transmettent des informations sur les publications aux adresses que
            vous configurez, et les clés d&apos;API, assistants d&apos;IA et
            applications que vous autorisez peuvent accéder à votre espace de
            travail.
          </p>
          <p>
            Nous pouvons communiquer des informations lorsque la loi
            l&apos;exige, ou pour protéger les droits, la sécurité et la sûreté
            de nos utilisateurs et du Service.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies et mesure d’audience',
      body: (
        <>
          <p>
            Le Service utilise uniquement les cookies nécessaires à son
            fonctionnement. Il n&apos;utilise aucun cookie de mesure
            d&apos;audience, de publicité ou de suivi, et aucun pixel de suivi
            n&apos;est activé.
          </p>
          {cookiesTable('fr', ['Cookie', 'Finalité', 'Durée'])}
          <p>
            Le Service conserve aussi des préférences d&apos;interface, ainsi
            que la page et le référent d&apos;arrivée, dans le stockage local de
            votre navigateur. Ils restent sur votre appareil et ne nous sont pas
            envoyés.
          </p>
        </>
      ),
    },
    {
      id: 'deletion',
      title: 'Conservation et suppression',
      body: (
        <>
          <h3>Durées de conservation</h3>
          <ul>
            <li>
              Votre compte, votre espace de travail, vos comptes connectés et
              votre contenu : tant que votre compte existe, sauf si vous les
              supprimez avant.
            </li>
            <li>
              Les publications, médias et canaux que vous supprimez sont
              immédiatement masqués dans le Service, mais restent dans la base
              de données (et les fichiers téléversés sur le serveur)
              jusqu&apos;à leur effacement :{' '}
              <Todo id="DATA_RETENTION_PERIOD_TO_CONFIRM" />.
            </li>
            <li>
              Sauvegardes : avant chaque mise à jour du logiciel, nous
              effectuons une sauvegarde complète de la base de données. Les 7
              sauvegardes les plus récentes sont conservées sur le serveur et
              les plus anciennes sont supprimées automatiquement.
            </li>
            <li>
              Journaux du serveur et de l&apos;application :{' '}
              <Todo id="DATA_RETENTION_PERIOD_TO_CONFIRM" />.
            </li>
            <li>
              E-mails d&apos;assistance :{' '}
              <Todo id="DATA_RETENTION_PERIOD_TO_CONFIRM" />.
            </li>
          </ul>
          <h3>Supprimer votre compte</h3>
          <p>
            Vous pouvez supprimer votre compte à tout moment dans{' '}
            <strong>Paramètres › Delete your account</strong> (ce libellé
            s&apos;affiche en anglais). Dans ce cas :
          </p>
          <ul>
            <li>
              votre adresse e-mail, vos nom et prénom et votre identifiant de
              connexion externe sont remplacés par des empreintes irréversibles,
              et votre mot de passe, votre biographie, votre photo de profil,
              votre adresse IP et votre type de navigateur sont supprimés ;
            </li>
            <li>
              les espaces de travail dont vous êtes le seul membre sont fermés :
              les jetons, noms et profils de leurs comptes connectés sont
              remplacés par des empreintes irréversibles, de sorte qu&apos;ils
              ne peuvent plus être utilisés, et leurs publications sont marquées
              comme supprimées ;
            </li>
            <li>
              vous êtes retiré des espaces de travail partagés avec
              d&apos;autres membres, qui conservent leur contenu.
            </li>
          </ul>
          <p>
            Pour faire effacer toutes les données restantes, y compris les
            publications supprimées et les fichiers téléversés, écrivez-nous à{' '}
            <ContactEmail /> depuis l&apos;adresse de votre compte. Nous vous
            confirmerons la fin de la suppression. Les données présentes dans
            les sauvegardes sont supprimées lorsque ces sauvegardes sont
            remplacées.
          </p>
          <h3>Supprimer les données reçues de Facebook, Instagram ou TikTok</h3>
          <p>
            Pour supprimer les données que nous détenons sur un compte Facebook,
            Instagram ou TikTok connecté : supprimez le canal dans Tayra Social
            (voir la section suivante), retirez l&apos;accès de Tayra Social
            dans les paramètres de la plateforme, et écrivez à <ContactEmail />{' '}
            pour faire effacer les données conservées.
          </p>
        </>
      ),
    },
    {
      id: 'disconnect',
      title: 'Déconnexion des comptes et révocation de l’accès',
      body: (
        <>
          <p>
            <strong>Dans Tayra Social :</strong> ouvrez le menu du canal dans la
            liste des canaux et choisissez <strong>Supprimer</strong> (vous
            pouvez aussi choisir <strong>Désactiver le canal</strong> pour le
            mettre en pause). Un canal supprimé n&apos;est plus utilisé : rien
            n&apos;y est publié et aucune donnée n&apos;en est récupérée. Ses
            jetons restent dans notre base de données jusqu&apos;à la
            suppression de votre compte ou jusqu&apos;à ce que vous nous
            demandiez de les effacer.
          </p>
          <p>
            <strong>Sur la plateforme :</strong> la révocation de l&apos;accès
            rend immédiatement les jetons conservés inutilisables. Le nom des
            menus peut varier selon la version de l&apos;application.
          </p>
          <ul>
            <li>
              Facebook : Paramètres et confidentialité › Paramètres ›
              Intégrations professionnelles (ou Applications et sites web), puis
              retirez Tayra Social.
            </li>
            <li>
              Instagram : Paramètres › Applications et sites web (Autorisations
              des sites web), puis retirez Tayra Social.
            </li>
            <li>
              TikTok : Paramètres et confidentialité › Sécurité › Gérer les
              autorisations des applications, puis retirez Tayra Social.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Vos droits et comment les exercer',
      body: (
        <>
          <p>
            Conformément à la loi n° 09-08, vous disposez d&apos;un droit
            d&apos;information sur le traitement de vos données, d&apos;un droit
            d&apos;accès, d&apos;un droit de rectification (correction,
            complément, mise à jour ou effacement) et d&apos;un droit
            d&apos;opposition pour des motifs légitimes. Vous pouvez également :
          </p>
          <ul>
            <li>
              consulter et corriger vos informations de profil dans les
              paramètres du Service ;
            </li>
            <li>déconnecter à tout moment un compte de réseau social ;</li>
            <li>supprimer votre compte, comme indiqué ci-dessus.</li>
          </ul>
          <p>
            Pour exercer vos droits, écrivez à <ContactEmail /> depuis
            l&apos;adresse de votre compte, ou joignez les informations
            permettant de vérifier votre identité. Le Service ne propose pas
            d&apos;export de données en libre-service ; nous fournissons une
            copie de vos données sur demande. Nous répondons dans les délais
            prévus par la loi applicable.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez
            introduire une réclamation auprès de la CNDP (
            <a href={CNDP_URL} target="_blank" rel="noopener noreferrer">
              www.cndp.ma
            </a>
            ). Selon votre lieu de résidence, d&apos;autres lois sur la
            protection des données peuvent vous accorder des droits
            supplémentaires.
          </p>
        </>
      ),
    },
    {
      id: 'transfers',
      title: 'Transferts internationaux de données',
      body: (
        <>
          <p>
            Le serveur qui fait fonctionner le Service est situé :{' '}
            <Detail
              value={LEGAL.hostingLocation}
              id="HOSTING_LOCATION_TO_VERIFY"
            />
            . Cloudflare achemine le trafic via son réseau mondial, et les
            plateformes que vous connectez (Meta, TikTok) traitent les données
            dans les pays où elles opèrent. Vos données peuvent donc être
            transférées et traitées dans des pays autres que le Maroc.
          </p>
          <p>
            Les transferts de données personnelles hors du Maroc sont effectués
            dans les conditions prévues par la loi n° 09-08 :{' '}
            <Todo id="CNDP_FORMALITIES_TO_VERIFY" />.
          </p>
        </>
      ),
    },
    {
      id: 'children',
      title: 'Enfants',
      body: (
        <p>
          Le Service est destiné aux entreprises et aux professionnels et ne
          s&apos;adresse pas aux enfants. Nous ne collectons pas sciemment de
          données concernant des enfants.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Modification de cette politique',
      body: (
        <p>
          Nous pouvons mettre à jour cette Politique de confidentialité. La date
          figurant en haut de cette page indique sa dernière modification. Si
          une modification est importante, nous vous en informerons dans le
          Service ou par e-mail avant son entrée en vigueur.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      body: (
        <>
          <p>
            Pour toute question ou demande concernant vos données personnelles,
            contactez-nous à l&apos;adresse <ContactEmail />.
          </p>
          <OperatorDetails lang="fr" />
        </>
      ),
    },
  ],
};

export const privacyContent: Record<LegalLang, LegalDocument> = { en, fr };
