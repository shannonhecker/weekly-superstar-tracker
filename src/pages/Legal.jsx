import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

const UPDATED = 'May 15, 2026'

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Winking Star is a family achievement tracker. We collect only the data needed to run shared family boards: parent account details, board membership, child display names, optional birthdays, optional avatar photos, activities, stickers, rewards, and app preferences.
      </p>
      <p>
        We use this data for app functionality, account security, syncing across devices, customer support, and legal compliance. We do not sell family data, serve third-party ads, or use children's data for tracking.
      </p>
      <p>
        Optional child birthdays are used only for birthday-week celebrations and reminders. Optional avatar photos are stored in Firebase Storage and are visible to signed-in members of the same family board.
      </p>
      <p>
        Family data is kept while the account or family board needs it. Deleting a child removes that child's saved data and avatar files. Deleting an account removes family spaces you manage and removes your membership from shared spaces managed by someone else, subject to short backup expiry.
      </p>
      <p>
        Parents and guardians can request access, correction, or deletion by using the in-app controls or contacting <a href="mailto:winkingstarapp@gmail.com">winkingstarapp@gmail.com</a>.
      </p>
    </LegalPage>
  )
}

export function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        Winking Star is for parents, guardians, and families to create private achievement boards. A parent or legal guardian must create and manage child profiles.
      </p>
      <p>
        You are responsible for the information you add to your family board and for sharing invite links only with trusted adults. Do not upload unlawful, harmful, or inappropriate content.
      </p>
      <p>
        The service is provided as-is. We may update, suspend, or discontinue features to protect families, comply with law, or improve reliability.
      </p>
      <p>
        You can stop using Winking Star at any time. Account deletion tools are available in the app, and support requests can be sent to <a href="mailto:winkingstarapp@gmail.com">winkingstarapp@gmail.com</a>.
      </p>
    </LegalPage>
  )
}

export function Support() {
  return (
    <LegalPage
      title="Support"
      eyebrow="Family help"
      updatedLabel="Support for Winking Star"
    >
      <section className="rounded-2xl bg-earthy-ivory/70 ring-1 ring-earthy-divider p-5">
        <h2 className="text-earthy-cocoa font-display text-2xl font-black mb-2">How can we help?</h2>
        <p>
          Email <a href="mailto:winkingstarapp@gmail.com">winkingstarapp@gmail.com</a> for help with your family board, account access, purchases, privacy, or anything that is not working as expected.
        </p>
        <a
          href="mailto:winkingstarapp@gmail.com?subject=Winking%20Star%20support"
          className="inline-flex mt-5 px-5 py-3 rounded-pill bg-earthy-cocoa text-earthy-cream text-sm font-extrabold no-underline hover:bg-[#4A2E25] active:scale-[0.99] transition-all"
        >
          Contact support
        </a>
      </section>

      <section>
        <h2 className="text-earthy-cocoa font-display text-xl font-black mb-2">Common questions</h2>
        <div className="space-y-3">
          <SupportItem title="Restore a purchase">
            Open the family board in the app, go to the locked feature, choose Restore purchase, and use the same Apple ID that made the original purchase.
          </SupportItem>
          <SupportItem title="Invite another grown-up">
            Open your family board, go to More, and use Share family board. Only share invite links with trusted adults.
          </SupportItem>
          <SupportItem title="Delete account or family data">
            Use the in-app account deletion tools, or email support from the parent account address and tell us what you want removed.
          </SupportItem>
          <SupportItem title="App review and privacy">
            Winking Star does not show third-party ads or sell family data. See the Privacy Policy for details.
          </SupportItem>
        </div>
      </section>

      <section className="rounded-2xl bg-earthy-card ring-1 ring-earthy-divider p-5">
        <h2 className="text-earthy-cocoa font-display text-xl font-black mb-2">What to include</h2>
        <p>
          Include your device model, iOS version, the screen you were using, and a screenshot if you have one. Do not send passwords or payment card details.
        </p>
      </section>
    </LegalPage>
  )
}

function LegalPage({ title, eyebrow = 'Winking Star', updatedLabel = `Last updated: ${UPDATED}`, children }) {
  return (
    <main id="main" className="min-h-screen bg-earthy-ivory px-5 py-8 font-jakarta">
      <article className="max-w-2xl mx-auto bg-earthy-card rounded-3xl shadow-earthy-lifted ring-1 ring-earthy-divider p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Logo size={44} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft">{eyebrow}</p>
            <h1 className="font-display font-black text-earthy-cocoa text-3xl tracking-tight">{title}</h1>
          </div>
        </div>
        <p className="text-xs font-bold text-earthy-cocoaSoft mb-6">{updatedLabel}</p>
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-earthy-cocoaSoft font-bold">
          {children}
        </div>
        <Link
          to="/"
          className="inline-flex mt-8 text-sm font-bold text-earthy-cocoa underline underline-offset-4"
        >
          Back to Winking Star
        </Link>
      </article>
    </main>
  )
}

function SupportItem({ title, children }) {
  return (
    <div className="rounded-2xl bg-earthy-ivory/60 ring-1 ring-earthy-divider p-4">
      <h3 className="text-earthy-cocoa font-extrabold mb-1">{title}</h3>
      <p>{children}</p>
    </div>
  )
}
