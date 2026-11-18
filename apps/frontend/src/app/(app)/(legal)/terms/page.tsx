import { Metadata } from 'next';
import {
  ContactEmail,
  Detail,
  LEGAL,
  LegalPage,
  LegalSection,
  Todo,
} from '@gitroom/frontend/components/legal/legal.page';
import { PRIVACY_URL, sourceCodeUrl } from '@gitroom/helpers/utils/brand';

export const metadata: Metadata = {
  title: 'Terms of Service | Tayra Social',
  description: 'The terms that apply to the use of Tayra Social.',
};

const sections: LegalSection[] = [
  {
    id: 'agreement',
    title: 'About these Terms',
    body: (
      <>
        <p>
          These Terms of Service (the &quot;Terms&quot;) govern your access to
          and use of Tayra Social, the web application available at{' '}
          <a href="https://social.maisontayra.com">
            https://social.maisontayra.com
          </a>{' '}
          (the &quot;Service&quot;). The Service is operated by{' '}
          <Detail value={LEGAL.operator} label="legal name of the operator" />{' '}
          (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
        </p>
        <p>
          By signing in to or using the Service you agree to these Terms and to
          our <a href={PRIVACY_URL}>Privacy Policy</a>. If you use the Service
          on behalf of a company or another organisation, you confirm that you
          are authorised to accept these Terms on its behalf.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'The Service',
    body: (
      <>
        <p>Tayra Social is a social media management tool. With it you can:</p>
        <ul>
          <li>connect social media accounts that you own or manage;</li>
          <li>
            write, schedule and publish posts with text, images and videos to
            those accounts;
          </li>
          <li>
            keep images and videos in a media library and edit images in the
            built-in editor;
          </li>
          <li>
            share preview links of a post so that others can view and comment on
            it before it is published;
          </li>
          <li>
            view analytics and comments that the platforms make available for
            your accounts and posts;
          </li>
          <li>work with teammates in a shared workspace;</li>
          <li>
            use the Service through its public API, through AI assistants that
            you authorise (MCP), and send post events to webhooks that you
            configure.
          </li>
        </ul>
        <p>
          The features available for each platform depend on what that platform
          allows. Tayra Social is based on the open-source software Postiz and
          is distributed under the GNU Affero General Public License v3.0
          (AGPL-3.0); the source code of the running version is available{' '}
          <a href={sourceCodeUrl()} target="_blank" rel="noopener noreferrer">
            here
          </a>
          . These Terms govern the hosted Service; they do not limit the rights
          that the AGPL-3.0 grants you over the source code.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and responsibilities',
    body: (
      <>
        <p>
          Public sign-up is currently closed. Accounts are created by us or by
          invitation to an existing workspace.
        </p>
        <ul>
          <li>You must give accurate information and keep it up to date.</li>
          <li>
            You must keep your password and your API keys confidential. You are
            responsible for all activity carried out with your account, your API
            keys and the AI assistants or applications you authorise.
          </li>
          <li>
            Tell us without delay at <ContactEmail /> if you believe your
            account has been used without your permission.
          </li>
          <li>
            Workspace members can see and use the channels, posts and media of
            their workspace. Invite only people you trust and remove members who
            should no longer have access.
          </li>
          <li>
            You must be old enough to enter into a binding contract where you
            live, and you must meet the age requirements of every platform you
            connect.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'connections',
    title: 'Connecting social media accounts',
    body: (
      <>
        <p>
          You connect a social media account by signing in on the
          platform&apos;s own page and approving the permissions it shows you.
          We never ask for and never receive your social media passwords.
        </p>
        <p>
          By connecting an account you authorise us to use the access granted by
          the platform, only to:
        </p>
        <ul>
          <li>
            publish the content you create, at the time you choose, with the
            settings you select;
          </li>
          <li>
            read the profile information, comments and analytics that the
            features you use need;
          </li>
          <li>keep the connection active by renewing its access.</li>
        </ul>
        <p>
          We act only on your instructions. We do not publish, like, comment or
          follow on your behalf on our own initiative. You confirm that you are
          allowed to connect each account, for example because it is yours or
          because its owner authorised you.
        </p>
        <p>
          You can disconnect an account at any time in the Service and revoke
          our access in the platform&apos;s settings, as described in the{' '}
          <a href={`${PRIVACY_URL}#disconnect`}>Privacy Policy</a>.
        </p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Your content and publishing authorisation',
    body: (
      <>
        <p>
          You keep all rights to the content you upload, write or publish
          through the Service (&quot;Your Content&quot;). You grant us a
          limited, non-exclusive licence to host, store, process, transmit and
          display Your Content, and to convert it into the formats a platform
          requires (for example resizing images or converting them to JPEG),
          only to provide the Service to you.
        </p>
        <p>
          When you schedule or publish a post, you instruct us to publish it to
          the accounts you selected at the time you chose. You are responsible
          for Your Content and its settings (such as its visibility), for having
          all rights and permissions it needs, and for complying with the rules
          of each platform. We do not review content before it is published.
        </p>
        <p>Please note:</p>
        <ul>
          <li>
            Images and videos you upload are stored on our server under a long,
            unlisted web address, so that the platforms can download them when a
            post is published. Anyone who has that address can open the file.
          </li>
          <li>
            Anyone who has the preview link of a post can view it and leave a
            comment on it.
          </li>
          <li>
            A platform may refuse, delay, change or remove a post. We cannot
            guarantee that a post will be published or stay online.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You must not use the Service to:</p>
        <ul>
          <li>
            publish or store content that is unlawful, infringes the rights of
            others, or is defamatory, harassing, hateful or deceptive;
          </li>
          <li>
            send spam or take part in inauthentic behaviour, such as fake
            engagement or misleading coordinated activity;
          </li>
          <li>
            break the terms, policies or limits of a connected platform, or try
            to get around them;
          </li>
          <li>
            access accounts, workspaces or data that you are not authorised to
            access;
          </li>
          <li>
            upload malware, or disrupt, overload or attempt to break the
            security of the Service;
          </li>
          <li>
            collect data about other people through the Service without a legal
            basis.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-party platforms',
    body: (
      <>
        <p>
          The Service works through the APIs of third-party platforms such as
          Facebook, Instagram and TikTok. When you use a platform through the
          Service, that platform&apos;s own terms and policies also apply to
          you, for example the{' '}
          <a
            href="https://www.facebook.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meta Terms of Service
          </a>
          , the{' '}
          <a
            href="https://help.instagram.com/581066165581870"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram Terms of Use
          </a>{' '}
          and the{' '}
          <a
            href="https://www.tiktok.com/legal/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok Terms of Service
          </a>
          .
        </p>
        <p>
          Platforms can change their APIs, limit features, require approvals or
          withdraw access at any time. Some connections are only available once
          a platform has approved our application. We are not responsible for
          the platforms, their decisions or their availability, and a feature
          may stop working when a platform changes.
        </p>
      </>
    ),
  },
  {
    id: 'fees',
    title: 'Fees',
    body: (
      <p>
        No payments are currently processed through the Service. If we introduce
        paid plans, we will show you the prices and the applicable terms before
        you are charged anything.
      </p>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes to the Service',
    body: (
      <p>
        We work to keep the Service available, but we do not guarantee that it
        will be uninterrupted or error-free. We may carry out maintenance, and
        change, add or remove features. Scheduled posts may be delayed or not
        published while the Service or a platform is unavailable.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    body: (
      <>
        <p>
          You can stop using the Service at any time and delete your account in
          the Service&apos;s settings (see{' '}
          <a href={`${PRIVACY_URL}#deletion`}>Retention and deletion</a>
          ).
        </p>
        <p>
          We may suspend or close your access if you breach these Terms, if your
          use puts the Service, other users or a platform at risk, if the law
          requires it, or if we stop providing the Service. Where reasonable, we
          will tell you in advance. After termination, your data is handled as
          described in our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Disclaimer and limitation of liability',
    body: (
      <>
        <p>
          To the extent permitted by law, the Service is provided &quot;as
          is&quot; and &quot;as available&quot;, without warranties of any kind.
        </p>
        <p>
          To the extent permitted by law, we are not liable for indirect or
          consequential losses, loss of profits, revenue, data or reputation, or
          for losses caused by a platform, including the removal of posts, the
          restriction or suspension of a social media account, or a post that
          was not published. Our total liability for all claims relating to the
          Service is limited to <Todo>maximum liability amount</Todo>.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited under
          applicable law.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these Terms',
    body: (
      <p>
        We may update these Terms. The date at the top of this page shows when
        they were last changed. If a change is significant, we will inform you
        in the Service or by email before it takes effect. If you continue to
        use the Service after the change, you accept the updated Terms.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: (
      <p>
        These Terms are governed by{' '}
        <Detail
          value={LEGAL.governingLaw}
          label="governing law and competent courts"
        />
        , without prejudice to any mandatory consumer protection rules of the
        country where you live.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        <Detail value={LEGAL.operator} label="legal name of the operator" />
        <br />
        <Detail value={LEGAL.address} label="registered address" />
        <br />
        Email: <ContactEmail />
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          Please read these Terms carefully. They explain what you can expect
          from Tayra Social and what we expect from you when you connect your
          social media accounts and publish through the Service.
        </p>
      }
      sections={sections}
    />
  );
}
