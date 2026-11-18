import { Metadata } from 'next';
import {
  ContactEmail,
  Detail,
  LEGAL,
  LegalPage,
  LegalSection,
  Todo,
} from '@gitroom/frontend/components/legal/legal.page';
import { TERMS_URL } from '@gitroom/helpers/utils/brand';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tayra Social',
  description:
    'How Tayra Social collects, uses, stores and deletes personal data and social media account data.',
};

// The permissions each platform connection requests, as declared in the
// provider files of libraries/nestjs-libraries/src/integrations/social.
// Keep in sync when a provider's scopes change.
const permissions: {
  platform: string;
  scopes: string[];
  purpose: string;
}[] = [
  {
    platform: 'Facebook Page',
    scopes: [
      'pages_show_list',
      'business_management',
      'pages_manage_posts',
      'pages_manage_engagement',
      'pages_read_engagement',
      'read_insights',
    ],
    purpose:
      'List the Pages you manage so you can choose which to connect, publish posts to them, read and answer comments, and show Page and post analytics.',
  },
  {
    platform: 'Instagram (via Facebook Business, Meta Unified Login)',
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
    ],
    purpose:
      'Read the profile of the Instagram professional accounts you select, publish posts, Reels, carousels and Stories, read and answer comments, and show account and post analytics.',
  },
  {
    platform: 'Instagram (Instagram Login)',
    scopes: [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
    ],
    purpose:
      'Same purposes as above, for Instagram professional accounts connected directly with Instagram, without a Facebook Page.',
  },
  {
    platform: 'TikTok',
    scopes: [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.list',
      'video.upload',
      'video.publish',
    ],
    purpose:
      'Show your TikTok name, avatar and account statistics, upload and publish the videos and photos you schedule (or send them to your TikTok inbox if you choose), and show your published videos and their statistics.',
  },
];

const cookies: { name: string; purpose: string; duration: string }[] = [
  {
    name: 'auth',
    purpose: 'Keeps you signed in (HTTP-only, secure).',
    duration: '1 year, or until you sign out',
  },
  {
    name: 'showorg',
    purpose: 'Remembers which workspace you are working in.',
    duration: '1 year',
  },
  {
    name: 'org',
    purpose: 'Carries a workspace invitation while you sign in.',
    duration: '2 days',
  },
  {
    name: 'i18next',
    purpose: 'Remembers the language of the interface.',
    duration: '7 days',
  },
  {
    name: 'oauth_state',
    purpose:
      'Protects sign-in with an external provider against forged requests.',
    duration: '10 minutes',
  },
  {
    name: 'impersonate',
    purpose:
      'Used only when an administrator opens an account to provide support.',
    duration: 'Until the administrator ends it (at most 1 year)',
  },
];

const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          This Privacy Policy explains how{' '}
          <Detail value={LEGAL.operator} label="legal name of the operator" />{' '}
          (&quot;we&quot;, &quot;us&quot;), the operator of Tayra Social at{' '}
          <a href="https://social.maisontayra.com">
            https://social.maisontayra.com
          </a>{' '}
          (the &quot;Service&quot;), handles personal data. We decide why and
          how this data is processed.
        </p>
        <p>
          Address: <Detail value={LEGAL.address} label="registered address" />
          <br />
          Contact for privacy requests: <ContactEmail />
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
            Your password, stored only as a one-way bcrypt hash. We cannot read
            it.
          </li>
          <li>
            If you sign in with an external provider such as Google, the name,
            email address and account identifier that provider shares with us.{' '}
            <Todo>
              confirm which external sign-in providers are enabled, or remove
              this point
            </Todo>
          </li>
          <li>
            The IP address and browser type (user agent) recorded when your
            account is created, and the time you were last active.
          </li>
          <li>Your email notification preferences.</li>
        </ul>
        <h3>Workspace information</h3>
        <p>
          Workspace name, members and their roles, invitations, API keys,
          webhook addresses, signatures, tags, RSS sources for automatic
          posting, and the AI assistants and applications you authorise.
        </p>
        <h3>Connected social media accounts</h3>
        <p>
          For each account you connect: its identifier on the platform, display
          name, username, profile picture, the access token and refresh token
          issued by the platform, their expiry date, and your settings for that
          account (such as preferred posting times).
        </p>
        <h3>Your content</h3>
        <p>
          Posts (text, title, media, platform settings, schedule and status),
          the identifiers and links of published posts, error messages returned
          by platforms, the images and videos you upload (with thumbnails and
          alternative text), images you create in the editor, and comments left
          on preview links, including the display name a commenter enters.
        </p>
        <h3>Data retrieved from the platforms</h3>
        <p>
          When you use these features, we retrieve from the platforms the list
          of pages or accounts you can connect, comments on your posts, and
          analytics such as followers, impressions, views, likes and comments.
          They are retrieved to show them to you and may be cached temporarily.
        </p>
        <h3>AI features</h3>
        <p>
          If you use the AI assistant, your messages and its answers are stored
          in our database so that you can continue the conversation.{' '}
          <Todo>
            confirm whether AI features are enabled and which provider processes
            the messages, or remove this section
          </Todo>
        </p>
        <h3>Technical information</h3>
        <p>
          Our reverse proxy and Cloudflare (see section 6) process the IP
          address, browser type, requested address and time of each request. The
          application logs errors, which can include the error returned by a
          platform.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use information',
    body: (
      <>
        <p>We use the information above only to:</p>
        <ul>
          <li>create your account, sign you in and keep it secure;</li>
          <li>
            publish your posts at the time you chose and show their status;
          </li>
          <li>show analytics and comments from your connected accounts;</li>
          <li>keep your connections active by renewing their access;</li>
          <li>
            send you the notifications you enabled, such as a post that failed;
          </li>
          <li>
            answer your requests, provide support, prevent abuse, keep backups
            and meet our legal obligations.
          </li>
        </ul>
        <p>
          We do not sell personal data or platform data. We do not use it for
          advertising, profiling or to train AI models, and we do not share data
          received from the platforms with data brokers or advertising networks.
          Data from a platform is used only to provide the features you use with
          that platform.
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
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Connection</th>
                <th>Permissions</th>
                <th>Why we need them</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.platform}>
                  <td className="min-w-[140px] text-white">{p.platform}</td>
                  <td className="min-w-[180px]">
                    {p.scopes.map((scope) => (
                      <code key={scope} className="block text-[13px]">
                        {scope}
                      </code>
                    ))}
                  </td>
                  <td className="min-w-[200px]">{p.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The Service performs actions on a platform only when you ask for them,
          such as publishing a post you scheduled. The platforms process data
          under their own privacy policies: the{' '}
          <a
            href="https://www.facebook.com/privacy/policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meta Privacy Policy
          </a>{' '}
          (Facebook and Instagram) and the{' '}
          <a
            href="https://www.tiktok.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok Privacy Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'tokens',
    title: 'How access tokens are stored and protected',
    body: (
      <>
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
          <li>Access to the server is restricted to our administrator.</li>
          <li>
            <Todo>
              encryption at rest: the software can encrypt stored tokens with
              AES-256-GCM, but it is enabled only when ENCRYPTION_PROVIDER is
              set on the server. State it here only once it is enabled, or
              remove this point
            </Todo>
          </li>
        </ul>
        <p>
          No system is completely secure. Passwords are stored as bcrypt hashes,
          sign-in cookies are HTTP-only and secure, and all traffic to the
          Service uses HTTPS. We do not claim any security certification.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing and service providers',
    body: (
      <>
        <p>
          We share personal data only with the following providers, and only as
          needed to run the Service:
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
                  Hosts the server (VPS) that runs the Service, its database and
                  the uploaded files.
                </td>
                <td>All data described in this policy</td>
              </tr>
              <tr>
                <td className="text-white">Cloudflare</td>
                <td>
                  Domain name service, HTTPS and network protection in front of
                  the Service.
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
                  <Todo>email delivery provider</Todo>
                </td>
                <td>
                  Sends account and notification emails, if email sending is
                  configured.
                </td>
                <td>Your email address and the email content</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Data also leaves the Service when you ask for it: posts go to the
          platforms you select, webhooks send post information to the addresses
          you configure, and the API keys, AI assistants and applications you
          authorise can access your workspace.
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
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((c) => (
                <tr key={c.name}>
                  <td>
                    <code className="text-white">{c.name}</code>
                  </td>
                  <td>{c.purpose}</td>
                  <td className="min-w-[110px]">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The Service also keeps interface preferences, and the page and
          referrer you arrived from, in your browser&apos;s local storage. They
          stay on your device and are not sent to us.
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
            We keep your account, workspace, connected accounts and content for
            as long as your account exists, unless you delete them earlier.
          </li>
          <li>
            Posts, media and channels that you delete are hidden from the
            Service immediately, but are kept in the database (and uploaded
            files on the server) until we remove them at your request.
          </li>
          <li>
            Before each update of the software we make a full backup of the
            database. The 7 most recent backups are kept on the server and older
            ones are deleted automatically.
          </li>
          <li>
            Logs: <Todo>retention period of proxy and application logs</Todo>
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
            connected accounts&apos; tokens, names and profiles are replaced by
            irreversible hashes, so they can no longer be used, and their posts
            are marked as deleted;
          </li>
          <li>
            you are removed from workspaces you share with other members, which
            keep their content.
          </li>
        </ul>
        <p>
          To have all remaining data erased, including deleted posts and
          uploaded files, email us at <ContactEmail /> from the address of your
          account. We will confirm once the deletion is complete. Data in
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
          <strong>In Tayra Social:</strong> open the menu of the channel in the
          channel list and choose <strong>Delete</strong> (you can also choose{' '}
          <strong>Disable Channel</strong> to pause it). A deleted channel is no
          longer used for anything: nothing is published to it and no data is
          retrieved from it. Its stored tokens remain in our database until you
          delete your account or ask us to erase them.
        </p>
        <p>
          <strong>On the platform:</strong> revoking access makes the stored
          tokens unusable immediately. Menu names can vary between app versions.
        </p>
        <ul>
          <li>
            Facebook: Settings &amp; privacy › Settings › Business integrations
            (or Apps and websites), then remove Tayra Social.
          </li>
          <li>
            Instagram: Settings › Apps and websites (Website permissions), then
            remove Tayra Social.
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
    title: 'Your choices and rights',
    body: (
      <>
        <p>You can:</p>
        <ul>
          <li>
            view and correct your profile information in the Service&apos;s
            settings;
          </li>
          <li>disconnect any social media account at any time;</li>
          <li>delete your account, as described above;</li>
          <li>
            ask us for a copy of your data, its correction or erasure, or the
            restriction of its use, and object to its use, by emailing{' '}
            <ContactEmail />. The Service has no self-service data export.
          </li>
        </ul>
        <p>
          Depending on where you live, data protection law may give you further
          rights, and you may complain to your data protection authority. We
          answer requests within the time the applicable law requires and may
          need to verify your identity first.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'International data transfers',
    body: (
      <p>
        The server that runs the Service is located in{' '}
        <Detail
          value={LEGAL.hostingLocation}
          label="country of the Hostinger data centre"
        />
        . Cloudflare handles traffic through its global network, and the
        platforms you connect process data in the countries they operate in, so
        your data may be processed outside your country. Contact us for more
        information.
      </p>
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
      <p>
        For any question or request about your data, contact us at{' '}
        <ContactEmail />.
        <br />
        <Detail value={LEGAL.operator} label="legal name of the operator" />
        <br />
        <Detail value={LEGAL.address} label="registered address" />
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what information Tayra Social collects, how it is
          used and protected, how you can delete it, and how you can disconnect
          your social media accounts. It applies together with our{' '}
          <a
            href={TERMS_URL}
            className="text-[#E5C97A] underline underline-offset-2"
          >
            Terms of Service
          </a>
          .
        </p>
      }
      sections={sections}
    />
  );
}
