// Style guide — single canvas for the earthy brand sweep.
// Renders every Phase 0 token plus prototype components on the new
// palette so the team can react to the SYSTEM in one place before any
// existing surface starts consuming it. Public route, no auth — this is
// a design tool, not user content.
//
// Sections:
//   1. Palette — earthy + legacy side by side
//   2. Typography — Plus Jakarta Sans scale
//   3. Buttons — primary / secondary / tertiary on cream
//   4. Cards — three elevation levels on cream / sage / ivory
//   5. Hexagonal level badge — prototype for replacing star+count
//   6. Form input — cream surface, cocoa text, terracotta focus
//   7. Bottom nav prototype — pill chrome with cocoa active state

const earthyPalette = [
  { name: 'sage',           hex: '#9DAC85', textOn: '#5A3A2E' },
  { name: 'sageDeep',       hex: '#6B8060', textOn: '#FFFAF0' },
  { name: 'cream',          hex: '#F8F1E4', textOn: '#5A3A2E' },
  { name: 'ivory',          hex: '#FFFAF0', textOn: '#5A3A2E' },
  { name: 'terracotta',     hex: '#D87C4A', textOn: '#FFFAF0' },
  { name: 'terracottaSoft', hex: '#F4C8A8', textOn: '#5A3A2E' },
  { name: 'cocoa',          hex: '#5A3A2E', textOn: '#FFFAF0' },
  { name: 'cocoaSoft',      hex: '#8B6651', textOn: '#FFFAF0' },
  { name: 'divider',        hex: '#E8DCC4', textOn: '#5A3A2E' },
]

const semanticPalette = [
  { name: 'success', hex: '#6B8060' },
  { name: 'warning', hex: '#D87C4A' },
  { name: 'danger',  hex: '#B85450' },
]

const typeScale = [
  { token: 'display-lg', size: '32px',  lineHeight: '40px', weight: 800, sample: 'Page hero — Welcome back, Emma' },
  { token: 'display-md', size: '24px',  lineHeight: '32px', weight: 800, sample: 'Section title — This week' },
  { token: 'display-sm', size: '20px',  lineHeight: '28px', weight: 700, sample: 'Card title — Mystery Pet' },
  { token: 'body-lg',    size: '18px',  lineHeight: '26px', weight: 500, sample: 'Description — Read for 20 minutes every day to grow your dragon.' },
  { token: 'body-md',    size: '16px',  lineHeight: '24px', weight: 500, sample: 'Body — Tap a square to mark it done.' },
  { token: 'body-sm',    size: '14px',  lineHeight: '20px', weight: 600, sample: 'Label — TOTAL POINTS' },
  { token: 'caption',    size: '12px',  lineHeight: '16px', weight: 600, sample: 'Caption — Updated 5 minutes ago' },
]

function Swatch({ name, hex, textOn }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-earthy-soft">
      <div className="aspect-square flex items-end p-3" style={{ background: hex }}>
        <span className="text-xs font-bold font-jakarta" style={{ color: textOn }}>
          {name}
        </span>
      </div>
      <div className="bg-earthy-ivory px-3 py-2 font-jakarta">
        <div className="text-[11px] font-bold text-earthy-cocoa">{hex.toUpperCase()}</div>
      </div>
    </div>
  )
}

function HexBadge({ tier = 4, size = 80 }) {
  const tierColor = tier >= 5 ? '#D87C4A' : tier >= 3 ? '#9DAC85' : '#8B6651'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`Tier ${tier} badge`}>
      <polygon
        points="50,4 90,27 90,73 50,96 10,73 10,27"
        fill={tierColor}
        stroke="#5A3A2E"
        strokeWidth="2"
      />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="Plus Jakarta Sans, system-ui"
        fontWeight="800"
        fontSize="34"
        fill="#FFFAF0"
      >
        {tier}
      </text>
    </svg>
  )
}

function Button({ variant = 'primary', children }) {
  // The previous `secondary` variant was `bg-earthy-terracotta text-earthy-ivory`
  // — 2.92:1, fails WCAG AA across the board (audit A4). Solid terracotta is
  // an accent surface, not a text-bearing surface; no light text colour
  // passes AA at normal size on it. Secondary now uses the same cocoa-on-
  // terracottaSoft pair the production buttons in KidEditModal already use
  // (6.58:1 ✓). The old `tertiary` was the same pair so it's been folded in.
  const styles = {
    primary: 'bg-earthy-cocoa text-earthy-ivory hover:bg-[#4A2E25]',
    secondary: 'bg-earthy-terracottaSoft text-earthy-cocoa hover:bg-[#EAB892]',
    ghost: 'bg-transparent text-earthy-cocoa hover:bg-earthy-cream border border-earthy-divider',
  }
  return (
    <button
      className={`px-5 py-3 rounded-pill font-jakarta font-bold text-sm transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

function Card({ elevation = 'soft', tone = 'cream', children }) {
  const tones = {
    cream: 'bg-earthy-cream',
    ivory: 'bg-earthy-ivory',
    sage: 'bg-earthy-sage',
  }
  const elevations = {
    flat: '',
    soft: 'shadow-earthy-soft',
    lifted: 'shadow-earthy-lifted',
  }
  return (
    <div className={`rounded-2xl p-5 ${tones[tone]} ${elevations[elevation]}`}>
      {children}
    </div>
  )
}

function Section({ title, description, children }) {
  return (
    <section className="mb-12">
      <h2 className="font-jakarta text-2xl font-extrabold text-earthy-cocoa mb-1">{title}</h2>
      {description && (
        <p className="font-jakarta text-sm text-earthy-cocoaSoft mb-5 max-w-prose">{description}</p>
      )}
      {children}
    </section>
  )
}

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-earthy-ivory font-jakarta">
      <header className="bg-earthy-sage px-6 py-10 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-bold text-earthy-cocoa/70 uppercase tracking-[0.18em] mb-2">
            Winking Star · Phase 0
          </div>
          <h1 className="font-jakarta text-4xl sm:text-5xl font-extrabold text-earthy-cocoa">
            Earthy direction · style guide
          </h1>
          <p className="font-jakarta text-base text-earthy-cocoa/80 mt-3 max-w-prose">
            Single canvas for the new direction. Every token, every primitive, before any existing
            surface starts consuming them. React here first; sweep later.
          </p>
        </div>
      </header>

      <main id="main" className="px-6 sm:px-12 py-10 max-w-5xl mx-auto">
        <Section title="Palette" description="Earthy primary palette. WCAG AA verified for the documented pairings.">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {earthyPalette.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
            {semanticPalette.map((s) => (
              <Swatch key={s.name} hex={s.hex} name={s.name} textOn="#FFFAF0" />
            ))}
          </div>
        </Section>

        <Section title="Typography" description="Plus Jakarta Sans — single family, two weight ranges. 700–800 for display, 400–600 for body.">
          <div className="rounded-2xl bg-earthy-cream p-6 shadow-earthy-soft space-y-4">
            {typeScale.map((t) => (
              <div key={t.token} className="border-b border-earthy-divider last:border-b-0 pb-3 last:pb-0">
                <div className="text-[11px] font-bold uppercase tracking-wide text-earthy-cocoaSoft mb-1">
                  {t.token} — {t.size} / {t.lineHeight} · {t.weight}
                </div>
                <div
                  className="text-earthy-cocoa font-jakarta"
                  style={{ fontSize: t.size, lineHeight: t.lineHeight, fontWeight: t.weight }}
                >
                  {t.sample}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons" description="Pill shape, 24px horizontal padding. Primary (cocoa-on-cream, 12.4:1) is the strongest CTA; secondary uses the soft terracotta chip surface (cocoa, 6.58:1) — the bold-terracotta solid was retired because no light-text colour passes AA on it; ghost is the outlined-cream variant.">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Continue</Button>
            <Button variant="secondary">Add task</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Section>

        <Section title="Cards · elevation" description="Flat / Soft / Lifted — three steps of cocoa-tinted shadow.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card elevation="flat" tone="cream">
              <div className="font-jakarta font-extrabold text-earthy-cocoa text-lg">Flat</div>
              <p className="font-jakarta text-sm text-earthy-cocoaSoft mt-2">No shadow. List rows, in-card sections.</p>
            </Card>
            <Card elevation="soft" tone="cream">
              <div className="font-jakarta font-extrabold text-earthy-cocoa text-lg">Soft</div>
              <p className="font-jakarta text-sm text-earthy-cocoaSoft mt-2">Default card shadow. Cocoa-tinted, very subtle.</p>
            </Card>
            <Card elevation="lifted" tone="cream">
              <div className="font-jakarta font-extrabold text-earthy-cocoa text-lg">Lifted</div>
              <p className="font-jakarta text-sm text-earthy-cocoaSoft mt-2">Modals, popovers, dragged states.</p>
            </Card>
          </div>
        </Section>

        <Section title="Hexagonal level badge" description="Replaces the star+count pattern in MysteryPet / ScoreBar. Tier colour shifts: cocoaSoft &lt; sage &lt; terracotta.">
          <div className="flex flex-wrap gap-6 items-center bg-earthy-cream p-6 rounded-2xl shadow-earthy-soft">
            <HexBadge tier={1} />
            <HexBadge tier={2} />
            <HexBadge tier={3} />
            <HexBadge tier={4} />
            <HexBadge tier={5} />
          </div>
        </Section>

        <Section title="Form input" description="Cream surface, cocoa text, terracotta focus ring. Generous 16px vertical padding.">
          <div className="bg-earthy-cream p-6 rounded-2xl shadow-earthy-soft max-w-md">
            <label className="block text-xs font-bold uppercase tracking-wide text-earthy-cocoaSoft mb-2">
              Kid's name
            </label>
            <input
              type="text"
              defaultValue="Emma"
              className="w-full px-4 py-3 rounded-2xl bg-earthy-ivory border-2 border-earthy-divider focus:border-earthy-terracotta focus:outline-none font-jakarta font-semibold text-earthy-cocoa"
            />
          </div>
        </Section>

        <Section title="Bottom nav prototype" description="Pill-shaped chrome, single active state in cocoa circle.">
          <div className="bg-earthy-cream rounded-pill shadow-earthy-soft p-2 max-w-sm flex justify-around items-center">
            {['Home', 'Stats', 'Alerts', 'You'].map((label, i) => (
              <button
                key={label}
                aria-label={label}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  i === 3 ? 'bg-earthy-cocoa text-earthy-ivory' : 'text-earthy-cocoaSoft'
                }`}
              >
                <span className="text-lg">{['⌂', '◫', '◐', '◯'][i]}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Side-by-side · current vs earthy" description="The same Board kid card, current direction left, earthy right.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4 bg-white border-2 border-purple-200 font-display">
              <div className="text-xs font-bold uppercase text-purple-500 mb-2">Current</div>
              <div className="text-2xl font-black bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Emma
              </div>
              <div className="text-3xl font-black text-purple-600 mt-1 tabular-nums">42<span className="opacity-40 text-xl">/70</span></div>
              <div className="h-3.5 rounded-full bg-purple-100 mt-2 overflow-hidden">
                <div className="h-full w-[60%] bg-gradient-to-r from-amber-400 to-pink-500" />
              </div>
            </div>
            <div className="rounded-2xl p-4 bg-earthy-cream font-jakarta shadow-earthy-soft">
              <div className="text-xs font-bold uppercase text-earthy-cocoaSoft mb-2">Earthy</div>
              <div className="text-2xl font-extrabold text-earthy-cocoa">Emma</div>
              <div className="text-3xl font-extrabold text-earthy-cocoa mt-1 tabular-nums">42<span className="opacity-40 text-xl">/70</span></div>
              <div className="h-3.5 rounded-full bg-earthy-divider mt-2 overflow-hidden">
                <div className="h-full w-[60%] bg-earthy-terracotta" />
              </div>
            </div>
          </div>
        </Section>
      </main>

      <footer className="px-6 sm:px-12 py-8 max-w-5xl mx-auto font-jakarta text-xs text-earthy-cocoaSoft">
        Plan: <code className="bg-earthy-cream px-2 py-0.5 rounded">~/.claude/plans/claudepick-up-winking-star-curious-aurora.md</code>
      </footer>
    </div>
  )
}
