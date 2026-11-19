import {
  ContactEmail,
  Detail,
  LEGAL,
  LegalDocument,
  LegalLang,
  OperatorDetails,
  legalHref,
} from '@gitroom/frontend/components/legal/legal.page';
import { PRIVACY_URL, sourceCodeUrl } from '@gitroom/helpers/utils/brand';

// Tayra Social Terms of Service, English and French. Both versions must say the
// same thing: change them together. Placeholders: deploy/LEGAL-CHECKLIST.md.

const platformTerms = (labels: [string, string, string]) => (
  <>
    <a
      href="https://www.facebook.com/terms"
      target="_blank"
      rel="noopener noreferrer"
    >
      {labels[0]}
    </a>
    ,{' '}
    <a
      href="https://help.instagram.com/581066165581870"
      target="_blank"
      rel="noopener noreferrer"
    >
      {labels[1]}
    </a>
    ,{' '}
    <a
      href="https://www.tiktok.com/legal/terms-of-service"
      target="_blank"
      rel="noopener noreferrer"
    >
      {labels[2]}
    </a>
  </>
);

const operatorSentence = (lang: LegalLang) =>
  lang === 'fr' ? (
    <>
      exploité sous le nom commercial {LEGAL.tradingName} par{' '}
      <Detail value={LEGAL.legalEntity} id="LEGAL_ENTITY_NAME_TO_CONFIRM" />
    </>
  ) : (
    <>
      operated under the trading name {LEGAL.tradingName} by{' '}
      <Detail value={LEGAL.legalEntity} id="LEGAL_ENTITY_NAME_TO_CONFIRM" />
    </>
  );

const en: LegalDocument = {
  title: 'Terms of Service',
  description: 'The terms that apply to the use of Tayra Social.',
  intro: (
    <p>
      Please read these Terms carefully. They explain what you can expect from
      Tayra Social and what we expect from you when you connect your social
      media accounts and publish through the Service.
    </p>
  ),
  sections: [
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
            (the &quot;Service&quot;). The Service is {operatorSentence('en')}{' '}
            (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
          </p>
          <p>
            By signing in to or using the Service you agree to these Terms and
            to our <a href={PRIVACY_URL}>Privacy Policy</a>. If you use the
            Service on behalf of a company or another organisation, you confirm
            that you are authorised to accept these Terms on its behalf.
          </p>
          <p>
            These Terms are available in English and French. Both versions have
            the same meaning.
          </p>
        </>
      ),
    },
    {
      id: 'service',
      title: 'The Service',
      body: (
        <>
          <p>
            Tayra Social is a social media management service. With it you can:
          </p>
          <ul>
            <li>
              create a user account and work in one or more workspaces
              (organisations) with teammates;
            </li>
            <li>
              connect social media accounts that you own or manage, by signing
              in on each platform (OAuth);
            </li>
            <li>
              write, schedule and publish posts with text, images and videos to
              those accounts;
            </li>
            <li>
              keep images and videos in a media library and edit images in the
              built-in editor;
            </li>
            <li>
              share preview links of a post so that others can view and comment
              on it before it is published;
            </li>
            <li>
              view the analytics and comments that the platforms make available
              for your accounts and posts;
            </li>
            <li>
              use the Service through its public API and through AI assistants
              that you authorise (MCP), and send post events to webhooks that
              you configure;
            </li>
            <li>contact us for support by email.</li>
          </ul>
          <p>
            The features available for each platform depend on what that
            platform allows.
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
              You must keep your password and your API keys confidential. You
              are responsible for all activity carried out with your account,
              your API keys and the AI assistants or applications you authorise.
            </li>
            <li>
              Tell us without delay at <ContactEmail /> if you believe your
              account has been used without your permission.
            </li>
            <li>
              Workspace members can see and use the channels, posts and media of
              their workspace. Invite only people you trust and remove members
              who should no longer have access.
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
            By connecting an account you authorise us to use the access granted
            by the platform, only to:
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
            We act only on your instructions. We do not publish, like, comment
            or follow on your behalf on our own initiative. You confirm that you
            are allowed to connect each account, for example because it is yours
            or because its owner authorised you.
          </p>
          <p>
            You can disconnect an account at any time in the Service and revoke
            our access in the platform&apos;s settings, as described in the{' '}
            <a href={legalHref('en', PRIVACY_URL, '#disconnect')}>
              Privacy Policy
            </a>
            .
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
            When you schedule or publish a post, you instruct us to publish it
            to the accounts you selected at the time you chose. You are
            responsible for Your Content and its settings (such as its
            visibility), for having all rights and permissions it needs, and for
            complying with the rules of each platform. We do not review content
            before it is published.
          </p>
          <p>Please note:</p>
          <ul>
            <li>
              Images and videos you upload are stored on our server under a
              long, unlisted web address, so that the platforms can download
              them when a post is published. Anyone who has that address can
              open the file.
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
              break the terms, policies or limits of a connected platform, or
              try to get around them;
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
              collect or process personal data of other people through the
              Service without a legal basis.
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
            {platformTerms([
              'Meta Terms of Service',
              'Instagram Terms of Use',
              'TikTok Terms of Service',
            ])}
            .
          </p>
          <p>
            Platforms can change their APIs, limit features, require approvals
            or withdraw access at any time. Some connections are only available
            once a platform has approved our application. We are not responsible
            for the platforms, their decisions or their availability, and a
            feature may stop working when a platform changes.
          </p>
        </>
      ),
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual property',
      body: (
        <>
          <p>
            Tayra Social is based on the open-source software Postiz and is
            distributed under the GNU Affero General Public License v3.0
            (AGPL-3.0). The source code of the running version is available{' '}
            <a href={sourceCodeUrl()} target="_blank" rel="noopener noreferrer">
              here
            </a>
            . These Terms govern the hosted Service; they do not limit the
            rights that the AGPL-3.0 grants you over the source code.
          </p>
          <p>
            The names Tayra Social and Maison Tayra and their logos identify the
            Service and its operator. You may not use them in a way that
            suggests an affiliation or endorsement without our written
            permission. Your Content remains yours, as described above.
          </p>
        </>
      ),
    },
    {
      id: 'fees',
      title: 'Fees',
      body: (
        <p>
          No payments are currently processed through the Service and it has no
          paid subscription. If paid plans are introduced, we will show you the
          prices and the applicable terms before you are charged anything.
        </p>
      ),
    },
    {
      id: 'support',
      title: 'Support',
      body: (
        <p>
          For help with the Service, contact us at <ContactEmail />. Phone:{' '}
          <Detail value={LEGAL.phone} id="SUPPORT_PHONE_TO_CONFIRM" />. We
          answer as soon as we reasonably can.
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
            You can stop using the Service at any time and delete your account
            in the Service&apos;s settings (see{' '}
            <a href={legalHref('en', PRIVACY_URL, '#deletion')}>
              Retention and deletion
            </a>
            ).
          </p>
          <p>
            We may suspend or close your access if you breach these Terms, if
            your use puts the Service, other users or a platform at risk, if the
            law requires it, or if we stop providing the Service. Where
            reasonable, we will tell you in advance. After termination, your
            data is handled as described in our Privacy Policy.
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
            is&quot; and &quot;as available&quot;, without warranties of any
            kind.
          </p>
          <p>
            To the extent permitted by law, we are not liable for indirect or
            consequential losses, loss of profits, revenue, data or reputation,
            or for losses caused by a platform, including the removal of posts,
            the restriction or suspension of a social media account, or a post
            that was not published.
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
      title: 'Governing law and disputes',
      body: (
        <>
          <p>
            These Terms are governed by the laws of the Kingdom of Morocco,
            without prejudice to any mandatory consumer protection rules that
            apply to you.
          </p>
          <p>
            If you have a complaint, please contact us first at <ContactEmail />{' '}
            so that we can try to resolve it amicably. If no amicable solution
            is found, the dispute will be brought before{' '}
            <Detail value={LEGAL.court} id="COMPETENT_COURT_TO_CONFIRM" />.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: 'Contact and legal information',
      body: <OperatorDetails lang="en" />,
    },
  ],
};

const fr: LegalDocument = {
  title: "Conditions générales d'utilisation",
  description:
    "Les conditions qui s'appliquent à l'utilisation de Tayra Social.",
  intro: (
    <p>
      Veuillez lire attentivement ces Conditions. Elles décrivent ce que vous
      pouvez attendre de Tayra Social et ce que nous attendons de vous lorsque
      vous connectez vos comptes de réseaux sociaux et publiez par
      l&apos;intermédiaire du Service.
    </p>
  ),
  sections: [
    {
      id: 'agreement',
      title: 'À propos de ces Conditions',
      body: (
        <>
          <p>
            Les présentes conditions générales d&apos;utilisation (les{' '}
            {'«\u00a0Conditions\u00a0»'}) régissent l&apos;accès à Tayra Social
            et son utilisation, l&apos;application web disponible à
            l&apos;adresse{' '}
            <a href="https://social.maisontayra.com">
              https://social.maisontayra.com
            </a>{' '}
            (le {'«\u00a0Service\u00a0»'}). Le Service est{' '}
            {operatorSentence('fr')} ({'«\u00a0nous\u00a0»'}).
          </p>
          <p>
            En vous connectant au Service ou en l&apos;utilisant, vous acceptez
            ces Conditions ainsi que notre{' '}
            <a href={legalHref('fr', PRIVACY_URL)}>
              Politique de confidentialité
            </a>
            . Si vous utilisez le Service pour le compte d&apos;une société ou
            d&apos;une autre organisation, vous confirmez être autorisé à
            accepter ces Conditions en son nom.
          </p>
          <p>
            Ces Conditions sont disponibles en anglais et en français. Les deux
            versions ont la même portée.
          </p>
        </>
      ),
    },
    {
      id: 'service',
      title: 'Le Service',
      body: (
        <>
          <p>
            Tayra Social est un service de gestion des réseaux sociaux. Il vous
            permet de :
          </p>
          <ul>
            <li>
              créer un compte utilisateur et travailler dans un ou plusieurs
              espaces de travail (organisations) avec vos collaborateurs ;
            </li>
            <li>
              connecter les comptes de réseaux sociaux que vous détenez ou
              gérez, en vous identifiant sur chaque plateforme (OAuth) ;
            </li>
            <li>
              rédiger, programmer et publier sur ces comptes des publications
              comprenant du texte, des images et des vidéos ;
            </li>
            <li>
              conserver des images et des vidéos dans une médiathèque et
              retoucher des images dans l&apos;éditeur intégré ;
            </li>
            <li>
              partager des liens d&apos;aperçu d&apos;une publication afin que
              d&apos;autres personnes puissent la consulter et la commenter
              avant sa publication ;
            </li>
            <li>
              consulter les statistiques et les commentaires que les plateformes
              mettent à disposition pour vos comptes et vos publications ;
            </li>
            <li>
              utiliser le Service au moyen de son API publique et des assistants
              d&apos;IA que vous autorisez (MCP), et envoyer des événements de
              publication aux webhooks que vous configurez ;
            </li>
            <li>contacter notre assistance par e-mail.</li>
          </ul>
          <p>
            Les fonctionnalités disponibles pour chaque plateforme dépendent de
            ce que celle-ci autorise.
          </p>
        </>
      ),
    },
    {
      id: 'accounts',
      title: 'Comptes et responsabilités',
      body: (
        <>
          <p>
            L&apos;inscription publique est actuellement fermée. Les comptes
            sont créés par nous ou sur invitation à un espace de travail
            existant.
          </p>
          <ul>
            <li>
              Vous devez fournir des informations exactes et les tenir à jour.
            </li>
            <li>
              Vous devez garder confidentiels votre mot de passe et vos clés
              d&apos;API. Vous êtes responsable de toute activité réalisée avec
              votre compte, vos clés d&apos;API et les assistants d&apos;IA ou
              applications que vous autorisez.
            </li>
            <li>
              Prévenez-nous sans délai à l&apos;adresse <ContactEmail /> si vous
              pensez que votre compte a été utilisé sans votre autorisation.
            </li>
            <li>
              Les membres d&apos;un espace de travail peuvent voir et utiliser
              ses canaux, publications et médias. N&apos;invitez que des
              personnes de confiance et retirez les membres qui ne doivent plus
              y avoir accès.
            </li>
            <li>
              Vous devez avoir l&apos;âge requis pour conclure un contrat là où
              vous résidez et respecter les conditions d&apos;âge de chaque
              plateforme que vous connectez.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'connections',
      title: 'Connexion des comptes de réseaux sociaux',
      body: (
        <>
          <p>
            Vous connectez un compte de réseau social en vous identifiant sur la
            page de la plateforme elle-même et en approuvant les autorisations
            qu&apos;elle vous présente. Nous ne vous demandons jamais et ne
            recevons jamais vos mots de passe de réseaux sociaux.
          </p>
          <p>
            En connectant un compte, vous nous autorisez à utiliser l&apos;accès
            accordé par la plateforme, uniquement pour :
          </p>
          <ul>
            <li>
              publier le contenu que vous créez, au moment que vous choisissez
              et avec les paramètres que vous sélectionnez ;
            </li>
            <li>
              lire les informations de profil, les commentaires et les
              statistiques nécessaires aux fonctionnalités que vous utilisez ;
            </li>
            <li>maintenir la connexion active en renouvelant son accès.</li>
          </ul>
          <p>
            Nous agissons uniquement sur vos instructions. Nous ne publions pas,
            n&apos;aimons pas, ne commentons pas et ne suivons pas de comptes en
            votre nom de notre propre initiative. Vous confirmez être autorisé à
            connecter chaque compte, par exemple parce qu&apos;il vous
            appartient ou parce que son titulaire vous y a autorisé.
          </p>
          <p>
            Vous pouvez déconnecter un compte à tout moment dans le Service et
            révoquer notre accès dans les paramètres de la plateforme, comme
            décrit dans la{' '}
            <a href={legalHref('fr', PRIVACY_URL, '#disconnect')}>
              Politique de confidentialité
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: 'content',
      title: 'Votre contenu et autorisation de publication',
      body: (
        <>
          <p>
            Vous conservez tous les droits sur le contenu que vous téléversez,
            rédigez ou publiez via le Service (« Votre Contenu »). Vous nous
            accordez une licence limitée et non exclusive pour héberger,
            stocker, traiter, transmettre et afficher Votre Contenu, et pour le
            convertir dans les formats exigés par une plateforme (par exemple
            redimensionner des images ou les convertir en JPEG), uniquement afin
            de vous fournir le Service.
          </p>
          <p>
            Lorsque vous programmez ou publiez une publication, vous nous
            demandez de la publier sur les comptes sélectionnés au moment
            choisi. Vous êtes responsable de Votre Contenu et de ses paramètres
            (comme sa visibilité), de disposer de tous les droits et
            autorisations nécessaires, et du respect des règles de chaque
            plateforme. Nous ne vérifions pas le contenu avant sa publication.
          </p>
          <p>À noter :</p>
          <ul>
            <li>
              Les images et vidéos que vous téléversez sont stockées sur notre
              serveur à une adresse web longue et non répertoriée, afin que les
              plateformes puissent les télécharger lors de la publication. Toute
              personne disposant de cette adresse peut ouvrir le fichier.
            </li>
            <li>
              Toute personne disposant du lien d&apos;aperçu d&apos;une
              publication peut la consulter et y laisser un commentaire.
            </li>
            <li>
              Une plateforme peut refuser, retarder, modifier ou supprimer une
              publication. Nous ne pouvons pas garantir qu&apos;une publication
              sera publiée ou restera en ligne.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'acceptable-use',
      title: 'Utilisation acceptable',
      body: (
        <>
          <p>Vous ne devez pas utiliser le Service pour :</p>
          <ul>
            <li>
              publier ou stocker un contenu illicite, portant atteinte aux
              droits d&apos;autrui, diffamatoire, harcelant, haineux ou trompeur
              ;
            </li>
            <li>
              envoyer du spam ou participer à des comportements inauthentiques,
              comme de faux engagements ou une activité coordonnée trompeuse ;
            </li>
            <li>
              enfreindre les conditions, règles ou limites d&apos;une plateforme
              connectée, ou tenter de les contourner ;
            </li>
            <li>
              accéder à des comptes, espaces de travail ou données auxquels vous
              n&apos;êtes pas autorisé à accéder ;
            </li>
            <li>
              téléverser des logiciels malveillants, ou perturber, surcharger ou
              tenter de compromettre la sécurité du Service ;
            </li>
            <li>
              collecter ou traiter des données personnelles d&apos;autres
              personnes via le Service sans base légale.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'third-parties',
      title: 'Plateformes tierces',
      body: (
        <>
          <p>
            Le Service fonctionne grâce aux API de plateformes tierces comme
            Facebook, Instagram et TikTok. Lorsque vous utilisez une plateforme
            via le Service, ses propres conditions et règles s&apos;appliquent
            également à vous, par exemple les{' '}
            {platformTerms([
              'conditions de service de Meta',
              "conditions d'utilisation d'Instagram",
              'conditions de service de TikTok',
            ])}
            .
          </p>
          <p>
            Les plateformes peuvent modifier leurs API, limiter des
            fonctionnalités, exiger des validations ou retirer leur accès à tout
            moment. Certaines connexions ne sont disponibles qu&apos;après
            l&apos;approbation de notre application par la plateforme. Nous ne
            sommes pas responsables des plateformes, de leurs décisions ni de
            leur disponibilité, et une fonctionnalité peut cesser de fonctionner
            lorsqu&apos;une plateforme évolue.
          </p>
        </>
      ),
    },
    {
      id: 'intellectual-property',
      title: 'Propriété intellectuelle',
      body: (
        <>
          <p>
            Tayra Social est basé sur le logiciel libre Postiz et est distribué
            sous la licence publique générale GNU Affero v3.0 (AGPL-3.0). Le
            code source de la version en service est disponible{' '}
            <a href={sourceCodeUrl()} target="_blank" rel="noopener noreferrer">
              ici
            </a>
            . Ces Conditions régissent le Service hébergé ; elles ne limitent
            pas les droits que l&apos;AGPL-3.0 vous accorde sur le code source.
          </p>
          <p>
            Les noms Tayra Social et Maison Tayra ainsi que leurs logos
            identifient le Service et son exploitant. Vous ne pouvez pas les
            utiliser d&apos;une manière qui suggère une affiliation ou un
            soutien sans notre autorisation écrite. Votre Contenu reste le
            vôtre, comme indiqué ci-dessus.
          </p>
        </>
      ),
    },
    {
      id: 'fees',
      title: 'Tarifs',
      body: (
        <p>
          Aucun paiement n&apos;est actuellement traité par le Service et il ne
          comporte aucun abonnement payant. Si des offres payantes sont
          introduites, nous vous présenterons les prix et les conditions
          applicables avant toute facturation.
        </p>
      ),
    },
    {
      id: 'support',
      title: 'Assistance',
      body: (
        <p>
          Pour toute aide concernant le Service, contactez-nous à l&apos;adresse{' '}
          <ContactEmail />. Téléphone :{' '}
          <Detail value={LEGAL.phone} id="SUPPORT_PHONE_TO_CONFIRM" />. Nous
          répondons dans les meilleurs délais raisonnables.
        </p>
      ),
    },
    {
      id: 'availability',
      title: 'Disponibilité et évolution du Service',
      body: (
        <p>
          Nous nous efforçons de maintenir le Service disponible, mais nous ne
          garantissons pas qu&apos;il fonctionnera sans interruption ni erreur.
          Nous pouvons effectuer des opérations de maintenance et modifier,
          ajouter ou supprimer des fonctionnalités. Les publications programmées
          peuvent être retardées ou ne pas être publiées lorsque le Service ou
          une plateforme est indisponible.
        </p>
      ),
    },
    {
      id: 'termination',
      title: 'Suspension et résiliation',
      body: (
        <>
          <p>
            Vous pouvez cesser d&apos;utiliser le Service à tout moment et
            supprimer votre compte dans les paramètres du Service (voir{' '}
            <a href={legalHref('fr', PRIVACY_URL, '#deletion')}>
              Conservation et suppression
            </a>
            ).
          </p>
          <p>
            Nous pouvons suspendre ou fermer votre accès si vous enfreignez ces
            Conditions, si votre utilisation met en danger le Service, les
            autres utilisateurs ou une plateforme, si la loi l&apos;exige, ou si
            nous cessons de fournir le Service. Lorsque cela est raisonnable,
            nous vous en informerons à l&apos;avance. Après la résiliation, vos
            données sont traitées comme décrit dans notre Politique de
            confidentialité.
          </p>
        </>
      ),
    },
    {
      id: 'liability',
      title: 'Exclusion de garanties et limitation de responsabilité',
      body: (
        <>
          <p>
            Dans les limites permises par la loi, le Service est fourni « en
            l&apos;état » et « selon disponibilité », sans garantie
            d&apos;aucune sorte.
          </p>
          <p>
            Dans les limites permises par la loi, nous ne sommes pas
            responsables des pertes indirectes ou consécutives, des pertes de
            bénéfices, de revenus, de données ou de réputation, ni des pertes
            causées par une plateforme, notamment la suppression de
            publications, la restriction ou la suspension d&apos;un compte de
            réseau social, ou une publication qui n&apos;a pas été publiée.
          </p>
          <p>
            Rien dans ces Conditions ne limite une responsabilité qui ne peut
            pas être limitée en vertu de la loi applicable.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      title: 'Modification de ces Conditions',
      body: (
        <p>
          Nous pouvons mettre à jour ces Conditions. La date figurant en haut de
          cette page indique leur dernière modification. Si une modification est
          importante, nous vous en informerons dans le Service ou par e-mail
          avant son entrée en vigueur. Si vous continuez à utiliser le Service
          après la modification, vous acceptez les Conditions mises à jour.
        </p>
      ),
    },
    {
      id: 'law',
      title: 'Droit applicable et litiges',
      body: (
        <>
          <p>
            Ces Conditions sont régies par le droit du Royaume du Maroc, sans
            préjudice des règles impératives de protection des consommateurs qui
            vous sont applicables.
          </p>
          <p>
            En cas de réclamation, contactez-nous d&apos;abord à l&apos;adresse{' '}
            <ContactEmail /> afin que nous puissions tenter de la résoudre à
            l&apos;amiable. À défaut de solution amiable, le litige sera porté
            devant{' '}
            <Detail value={LEGAL.court} id="COMPETENT_COURT_TO_CONFIRM" />.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: 'Contact et mentions légales',
      body: <OperatorDetails lang="fr" />,
    },
  ],
};

export const termsContent: Record<LegalLang, LegalDocument> = { en, fr };
