import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

// Public privacy policy. Required by Apple App Store + Google Play for any
// app with sign-in. Wired up at winkingstar.com/privacy and linked from
// App Store Connect's "Privacy Policy URL" field.
//
// Contact email is intentionally the owner's gmail (low-friction support
// channel for a small kids' app); swap to a custom domain alias if support
// volume grows.

const LAST_UPDATED = '2026-05-01'
const CONTACT_EMAIL = 'dabinshine@gmail.com'

export default function Privacy() {
  return (
    <main
      id="main"
      className="min-h-screen px-5 py-10 bg-earthy-ivory font-jakarta text-earthy-cocoa"
    >
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-block mb-6">
          <Logo />
        </Link>

        <article className="bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-7 sm:p-10 space-y-6">
          <header className="space-y-2">
            <h1 className="font-extrabold text-3xl sm:text-4xl tracking-tight">
              Privacy policy
            </h1>
            <p className="text-earthy-cocoaSoft text-sm font-semibold">
              Last updated: <time dateTime={LAST_UPDATED}>{LAST_UPDATED}</time>
            </p>
          </header>

          <Section title="Who we are">
            <P>
              Winking Star is a kids' weekly reward chart and achievement tracker, available
              at <strong>winkingstar.com</strong> and as an iOS app. It's built and operated
              by an independent maker. If you have a question about your data,
              email{' '}
              <a className="underline font-bold" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </P>
          </Section>

          <Section title="The short version">
            <Bullets>
              <li>We collect the minimum needed to run the app: your sign-in details and the boards / kids / activities you create.</li>
              <li>We do not run ads, do not use third-party analytics, and do not sell or share your data.</li>
              <li>You can delete your account and all your boards at any time from inside the app.</li>
              <li>Data is stored on Google Cloud (Firebase). Google is our only data processor.</li>
            </Bullets>
          </Section>

          <Section title="What we collect, and why">
            <P><strong>Account information.</strong> When you sign up, we store your email address and a Firebase account record. If you sign in with Google or Apple, we store the OAuth identifier those providers return — never your password. We use this only to sign you in and identify your boards.</P>
            <P><strong>Board and kid information you enter.</strong> Boards have a name and a share code. Kids on a board have a name, optional birthday, optional avatar image, a chosen theme, and the activities you tick each day. We store this so the app can show your week, calculate streaks, and award stickers and pets. Other people can only see this data if you share your board's join code with them.</P>
            <P><strong>Anonymous join sessions.</strong> If you join a shared board via a link without signing up, we create a temporary anonymous session so the app can sync your view. Anonymous sessions can be upgraded to full accounts; doing so links the session's read access to a real email.</P>
            <P><strong>What we don't collect.</strong> We do not collect location, contacts, calendar, photos other than the avatar you choose, microphone, advertising IDs, or device fingerprints beyond what Firebase needs to authenticate you. We don't use cookies for tracking; only the session cookie Firebase sets to keep you signed in.</P>
          </Section>

          <Section title="Children's privacy">
            <P>
              Winking Star is designed to be used by parents and caregivers to track
              their own children's activities. Children's names and birthdays exist in
              the app only because a parent voluntarily entered them on a private board
              they administer.
            </P>
            <P>
              We do not market to children, do not collect data about a child's behaviour
              outside of the activities a parent ticks, and do not knowingly allow children
              to create their own accounts. If a child has been given a join link to view
              a parent's board, the underlying board is still administered by an adult and
              all data is controlled by that adult.
            </P>
            <P>
              If you believe a child has signed up for an account on their own without
              parental involvement, email{' '}
              <a className="underline font-bold" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{' '}
              and we will delete the account.
            </P>
          </Section>

          <Section title="Who can see your data">
            <Bullets>
              <li><strong>You</strong>, when signed in.</li>
              <li><strong>Anyone you share your board's join code with</strong>. Only people you give the code to can join. Members can be removed by the admin or can leave themselves.</li>
              <li><strong>Google (Firebase)</strong> as our infrastructure provider. They store the data on our behalf under their own privacy commitments. They do not use it to train ads or any other product.</li>
              <li><strong>Nobody else.</strong> We do not sell, share, or rent your data to third parties.</li>
            </Bullets>
          </Section>

          <Section title="Where your data lives">
            <P>
              We use Google Firebase: Firebase Authentication for sign-in, Firestore for
              board and kid data, Firebase Hosting for the website, and Firebase Storage
              for avatar images. Firebase stores data in Google Cloud data centres; the
              physical location depends on Google's regional defaults.
            </P>
          </Section>

          <Section title="How long we keep it">
            <P>
              We keep your data for as long as your account exists. When you delete your
              account, we immediately delete:
            </P>
            <Bullets>
              <li>your sign-in record,</li>
              <li>every board you administer, including all kids, activities, and weekly history on those boards,</li>
              <li>your membership on any boards you joined as a non-admin (those boards stay alive for the admin and other members).</li>
            </Bullets>
            <P>
              Backup copies held by Google may persist for up to 30 days before they
              are recycled out of Google's storage.
            </P>
          </Section>

          <Section title="Your rights">
            <Bullets>
              <li><strong>Access and correction.</strong> Sign in to view or edit any data you've entered.</li>
              <li><strong>Deletion.</strong> Open the ⋯ menu in the app and choose "Delete account" — or visit <Link className="underline font-bold" to="/settings/delete-account">/settings/delete-account</Link> directly. Apple App Store and Google Play require this option, and we believe it should be easy to use.</li>
              <li><strong>Portability.</strong> Email us if you'd like a copy of your data; we'll send it as a JSON export within 30 days.</li>
              <li><strong>Questions or complaints.</strong> Email{' '}
                <a className="underline font-bold" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
                . If you're in the EU/UK and unsatisfied, you also have the right to complain to your local data-protection authority.
              </li>
            </Bullets>
          </Section>

          <Section title="Cookies and tracking">
            <P>
              Winking Star uses one cookie: the Firebase session cookie that keeps you
              signed in. We do not use Google Analytics, Facebook Pixel, advertising
              SDKs, or any third-party tracker.
            </P>
          </Section>

          <Section title="Security">
            <P>
              All traffic is encrypted in transit via HTTPS. Firestore enforces a strict
              security ruleset: a board's data can only be read or modified by signed-in
              members of that board, and only the admin can delete it. Passwords are
              never seen by us — Firebase Authentication holds them in a hashed form.
            </P>
          </Section>

          <Section title="Changes to this policy">
            <P>
              If we make a meaningful change, we'll update the date at the top of this
              page and, where reasonable, notify users via the app the next time they
              sign in. Routine clarifications won't trigger a notification.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Email{' '}
              <a className="underline font-bold" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              {' '}— that's the fastest way to reach a human.
            </P>
          </Section>
        </article>

        <p className="text-center text-earthy-cocoaSoft text-xs font-semibold mt-6">
          <Link to="/" className="hover:text-earthy-cocoa">← Back to Winking Star</Link>
        </p>
      </div>
    </main>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-extrabold text-xl tracking-tight">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-earthy-cocoa">
        {children}
      </div>
    </section>
  )
}

function P({ children }) {
  return <p>{children}</p>
}

function Bullets({ children }) {
  return (
    <ul className="space-y-2 pl-1">
      {Array.isArray(children)
        ? children.map((c, i) => <BulletRow key={i}>{c.props.children}</BulletRow>)
        : <BulletRow>{children?.props?.children ?? children}</BulletRow>}
    </ul>
  )
}

function BulletRow({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-earthy-cocoaSoft shrink-0"
      />
      <span className="flex-1">{children}</span>
    </li>
  )
}
