import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES } from '@weekly-superstar/shared/themes'

const earthy = colors.earthy

// Mirrored from the iOS app's VOY_PALETTE so the signup preview uses the
// same product UI language while the frame still sits on the web earthy tokens.
const app = {
  forest: '#12351F',
  textSecondary: '#304332',
  mutedText: '#63705F',
  canvas: '#F7F5EF',
  surface: '#FFFFFF',
  surfaceMuted: '#FBFAF6',
  mist: '#EEF3DD',
  divider: '#E7E1D6',
}

const PREVIEW_TOKENS = {
  '--ws-ui-page': earthy.card,
  '--ws-ui-frame': app.canvas,
  '--ws-ui-surface': app.surface,
  '--ws-ui-surface-muted': app.surfaceMuted,
  '--ws-ui-text': app.forest,
  '--ws-ui-text-secondary': app.textSecondary,
  '--ws-ui-muted': app.mutedText,
  '--ws-ui-border': app.divider,
  '--ws-ui-accent': app.forest,
  '--ws-ui-accent-muted': app.mist,
  '--ws-ui-track': earthy.cream,
  '--ws-ui-shell-border': earthy.dividerCream,
}

const SCREEN_BY_VARIANT = {
  board: 'home',
  themes: 'themes',
  kid: 'activity',
  records: 'progress',
}

const SCREENS = {
  home: {
    aria: 'Preview of the Winking Star home board with family progress and kid cards',
    banner: onboardingBanner('home-star-hero'),
    title: "Lili's Family",
    date: 'Sunday 17 May',
    heroTitle: 'Today',
    heroMeta: '0/40 done',
    badge: '4 KIDS',
  },
  themes: {
    aria: 'Preview of the Winking Star theme picker with real board banner styles',
    banner: themeBanner('deer'),
    title: 'Pick their world',
    date: 'Themes update every board screen',
    heroTitle: 'Forest',
    heroMeta: 'Mimi selected',
    badge: 'LIVE',
  },
  activity: {
    aria: 'Preview of the Winking Star activity board with star spots',
    banner: themeBanner('deer'),
    title: 'Activity',
    date: "Choose a superstar, then tap today's big star spots.",
    heroTitle: "Mimi's star week",
    heroMeta: '20/70 stars',
    badge: 'TODAY',
  },
  progress: {
    aria: 'Preview of the Winking Star progress screen with records and celebrations',
    banner: themeBanner('rocket'),
    title: 'Progress',
    date: 'Stars, streaks, badges, and treasure progress.',
    heroTitle: 'Progress saved',
    heroMeta: '42 stars this week',
    badge: 'SYNCED',
  },
}

const KIDS = [
  { name: 'Lili', emoji: '🦊', done: 6, total: 10, banner: 'fox', theme: THEMES.fox, buddy: 'fish', buddyEmoji: '🐠' },
  { name: 'Ben', emoji: '🐘', done: 3, total: 10, banner: 'elephant', theme: THEMES.elephant, buddy: 'mystery egg', buddyEmoji: '🥚' },
  { name: 'Hah', emoji: '🦋', done: 7, total: 10, banner: 'rocket', theme: THEMES.rocket, buddy: 'moon rover', buddyEmoji: '🛸' },
  { name: 'Mimi', emoji: '🦌', done: 20, total: 70, banner: 'deer', theme: THEMES.deer, buddy: 'galaxy', buddyEmoji: '🌌' },
]

const TASKS = [
  { label: 'Sleep', emoji: '😴', done: true },
  { label: 'Bath', emoji: '🛁', done: false },
  { label: 'Teeth', emoji: '🪥', done: true },
  { label: 'Reading', emoji: '📚', done: false },
]

const RECORDS = [
  { label: 'Streak', value: '8 days' },
  { label: 'Badges', value: '12' },
  { label: 'Best week', value: '42 stars' },
]

export default function ProductPreview({ className = '', compact = false, variant = 'board' }) {
  const screenKey = SCREEN_BY_VARIANT[variant] || 'home'
  const screen = SCREENS[screenKey]
  const previewHeight = compact ? 460 : 640

  return (
    <section
      role="img"
      aria-label={screen.aria}
      className={[
        'ws-product-preview relative w-full min-w-0 overflow-hidden rounded-[30px] border border-earthy-dividerCream bg-earthy-card shadow-earthy-soft',
        compact ? 'p-2' : 'p-3 sm:p-4',
        className,
      ].filter(Boolean).join(' ')}
      style={{ '--ws-preview-height': `${previewHeight}px`, ...PREVIEW_TOKENS }}
    >
      <style>{`
        .ws-product-preview {
          height: var(--ws-preview-height);
          width: 100%;
          background: var(--ws-ui-page);
        }
        .ws-app-frame {
          position: relative;
          height: 100%;
          overflow: hidden;
          border-radius: 26px;
          border: 1px solid var(--ws-ui-shell-border);
          background: var(--ws-ui-frame);
        }
        .ws-app-banner {
          position: relative;
          height: 188px;
          overflow: hidden;
          background: var(--ws-ui-track);
        }
        .ws-app-banner picture,
        .ws-app-banner img {
          display: block;
          width: 100%;
          height: 100%;
        }
        .ws-app-banner img {
          min-width: 100%;
          min-height: 100%;
          object-fit: cover;
        }
        .ws-app-banner img[data-crop="theme"],
        .ws-theme-tile-art img {
          transform: scale(1.38);
        }
        .ws-app-card-wrap {
          position: relative;
          height: calc(100% - 146px);
          margin-top: -42px;
          padding: 0 12px 12px;
        }
        .ws-app-sheet {
          height: 100%;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid var(--ws-ui-border);
          background: var(--ws-ui-surface);
          box-shadow: 0 16px 36px rgba(18, 53, 31, 0.10);
        }
        .ws-app-content {
          height: 100%;
          overflow: hidden;
          padding: 16px;
        }
        .ws-week-strip {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
          padding: 8px;
          border: 1px solid var(--ws-ui-border);
          border-radius: 18px;
          background: var(--ws-ui-surface);
        }
        .ws-week-day {
          min-height: 72px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--ws-ui-text);
          background: var(--ws-ui-surface-muted);
        }
        .ws-week-day-current {
          color: var(--ws-ui-surface);
          background: var(--ws-ui-accent);
        }
        .ws-week-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 20px;
          margin-top: 4px;
          border-radius: 999px;
          background: var(--ws-ui-surface);
          color: var(--ws-ui-muted);
          font-size: 11px;
          font-weight: 900;
        }
        .ws-ui-title { color: var(--ws-ui-text); }
        .ws-ui-subtitle { color: var(--ws-ui-text-secondary); }
        .ws-ui-muted { color: var(--ws-ui-muted); }
        .ws-ui-badge {
          border-color: var(--ws-ui-border);
          background: var(--ws-ui-accent-muted);
          color: var(--ws-ui-text);
        }
        .ws-ui-progress {
          border-color: var(--ws-ui-shell-border);
          background: var(--ws-ui-track);
          box-shadow: inset 0 0 0 1px rgba(90, 58, 46, 0.05);
        }
        .ws-ui-progress-fill { background: color-mix(in srgb, var(--ws-ui-accent) 34%, var(--ws-ui-accent-muted)); }
        .ws-ui-soft-card {
          border-color: var(--ws-ui-border);
          background: var(--ws-ui-surface-muted);
        }
        .ws-ui-card {
          border-color: var(--ws-ui-border);
          background: var(--ws-ui-surface);
        }
        @media (prefers-reduced-motion: no-preference) {
          .ws-product-preview {
            animation: ws-app-preview-settle 760ms cubic-bezier(0.2, 0, 0, 1);
          }
          .ws-app-sheet {
            animation: ws-app-sheet-rise 820ms cubic-bezier(0.2, 0, 0, 1) both;
          }
          .ws-app-fill {
            transform-origin: left center;
            animation: ws-app-fill 1800ms cubic-bezier(0.2, 0, 0, 1) 260ms both;
          }
          .ws-app-pop {
            animation: ws-app-pop 720ms cubic-bezier(0.2, 0, 0, 1) both;
          }
          .ws-app-float {
            animation: ws-app-float 4.2s ease-in-out infinite;
          }
          .ws-app-task-on {
            animation: ws-app-check 1100ms cubic-bezier(0.2, 0, 0, 1) 340ms both;
          }
        }

        @keyframes ws-app-preview-settle {
          from { opacity: 0.74; transform: translateY(6px) scale(0.992); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ws-app-sheet-rise {
          from { opacity: 0.88; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ws-app-fill {
          from { transform: scaleX(0.05); }
          to { transform: scaleX(1); }
        }
        @keyframes ws-app-pop {
          0% { opacity: 0; transform: scale(0.84); }
          65% { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ws-app-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -4px, 0); }
        }
        @keyframes ws-app-check {
          0% { transform: scale(0.78); background: var(--ws-ui-surface); }
          60% { transform: scale(1.1); background: var(--ws-ui-accent-muted); }
          100% { transform: scale(1); background: var(--ws-ui-surface); }
        }
      `}</style>

      <div className="ws-app-frame">
        <div className="absolute right-4 top-4 z-10 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ws-ui-accent)] opacity-45" />
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ws-ui-accent)] opacity-45" />
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ws-ui-accent)] opacity-45" />
        </div>

        <PreviewBanner banner={screen.banner} />

        <div className="ws-app-card-wrap">
          <div className="ws-app-sheet">
            <div className="ws-app-content">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="ws-ui-title font-display text-[28px] font-black leading-none tracking-normal">
                    {screen.title}
                  </h3>
                  <p className="ws-ui-muted mt-1.5 text-[13px] font-extrabold leading-snug">
                    {screen.date}
                  </p>
                </div>
                <span className="ws-ui-badge shrink-0 rounded-[20px] border px-3 py-2 text-center text-[12px] font-black leading-tight">
                  {screen.badge}
                </span>
              </header>

              {screenKey === 'home' && <HomeScreen compact={compact} />}
              {screenKey === 'themes' && <ThemeScreen compact={compact} />}
              {screenKey === 'activity' && <ActivityScreen compact={compact} />}
              {screenKey === 'progress' && <ProgressScreen compact={compact} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeScreen({ compact }) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="ws-ui-title font-display text-[26px] font-black leading-none">Today</p>
          <p className="ws-ui-subtitle mt-1 text-[14px] font-black">0/40 done</p>
        </div>
        <ProgressBadge value="4" label="KIDS" />
      </div>
      <ProgressTrack width="28%" />
      <div className={compact ? 'mt-4 grid gap-2' : 'mt-4 grid grid-cols-2 gap-3'}>
        {KIDS.slice(0, compact ? 2 : 4).map((kid, index) => (
          <KidSummaryCard key={kid.name} kid={kid} delay={index * 70} />
        ))}
      </div>
    </div>
  )
}

function ThemeScreen({ compact }) {
  return (
    <div>
      <div className={compact ? 'grid gap-3' : 'grid grid-cols-2 gap-3'}>
        {KIDS.slice(0, compact ? 2 : 4).map((kid, index) => (
          <ThemeTile key={kid.name} kid={kid} selected={kid.name === 'Mimi'} delay={index * 70} />
        ))}
      </div>
    </div>
  )
}

function ActivityScreen({ compact }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {KIDS.map((kid, index) => (
          <span
            key={kid.name}
            className={[
              'ws-app-pop flex h-9 items-center justify-center rounded-full border text-lg',
              kid.name === 'Mimi' ? 'w-[92px] gap-2 border-[color:var(--ws-ui-accent)] bg-white px-2' : 'w-9 border-[color:var(--ws-ui-border)] bg-[color:var(--ws-ui-surface-muted)]',
            ].join(' ')}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span aria-hidden>{kid.emoji}</span>
            {kid.name === 'Mimi' ? <span className="ws-ui-subtitle text-[13px] font-black">Mimi</span> : null}
          </span>
        ))}
      </div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="ws-ui-title font-display text-[24px] font-black leading-none">Mimi&apos;s star week</p>
          <p className="ws-ui-subtitle mt-1 text-[13px] font-black">Tap big rows for stars.</p>
        </div>
        <ProgressBadge value="20/70" label="STARS" />
      </div>
      <ProgressTrack width="42%" />
      <WeekStrip />
      <div className={compact ? 'mt-3 grid gap-2' : 'mt-3 grid grid-cols-2 gap-2'}>
        {TASKS.slice(0, compact ? 2 : 4).map((task, index) => (
          <TaskRow key={task.label} task={task} delay={index * 80} />
        ))}
      </div>
    </div>
  )
}

function ProgressScreen({ compact }) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="ws-ui-title font-display text-[24px] font-black leading-none">Mimi&apos;s progress</p>
          <p className="ws-ui-subtitle mt-1 text-[13px] font-black">Stars, badges, and saved records.</p>
        </div>
        <ProgressBadge value="42" label="STARS" />
      </div>
      <ProgressTrack width="78%" />
      <div className={compact ? 'mt-4 grid gap-3' : 'mt-4 grid grid-cols-[1.1fr_0.9fr] gap-3'}>
        <div className="ws-ui-soft-card rounded-[18px] border p-3">
          <p className="ws-ui-muted text-[11px] font-black uppercase tracking-[0.08em]">Recent celebrations</p>
          <CelebrationLine icon="🎉" title="Mimi hatched galaxy" meta='Named "Nova"' delay={60} />
          <CelebrationLine icon="🥈" title="Silver badge" meta="36 stars this week" delay={120} />
          <CelebrationLine icon="⭐" title="Best week" meta="42 stars" delay={180} />
        </div>
        <div className="grid gap-2">
          {RECORDS.map((record, index) => (
            <div
              key={record.label}
              className="ws-ui-soft-card ws-app-pop flex items-center justify-between rounded-[16px] px-3 py-2"
              style={{ animationDelay: `${80 + index * 70}ms` }}
            >
              <span className="ws-ui-muted text-[12px] font-black">{record.label}</span>
              <span className="ws-ui-title text-[12px] font-black">{record.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreviewBanner({ banner }) {
  return (
    <div className="ws-app-banner">
      <picture>
        {banner.webp ? <source type="image/webp" srcSet={banner.webp} sizes="(min-width: 1024px) 522px, 90vw" /> : null}
        <img
          src={banner.src}
          alt=""
          loading="eager"
          decoding="async"
          style={{ objectPosition: banner.position || 'center' }}
          data-crop={banner.crop || undefined}
        />
      </picture>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-white/0 via-white/30 to-[color:var(--ws-ui-frame)]" />
    </div>
  )
}

function KidSummaryCard({ kid, delay }) {
  return (
    <div
      className="ws-ui-card ws-app-pop rounded-[18px] border p-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--ws-ui-surface-muted)] text-xl ring-2 ring-white shadow-earthy-card">
          {kid.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="ws-ui-title truncate text-[17px] font-black">{kid.name}</p>
          <p className="ws-ui-muted text-[12px] font-black">{kid.done}/{kid.total} today</p>
        </div>
      </div>
      <ProgressTrack width={kid.done ? '45%' : '6%'} small />
    </div>
  )
}

function ThemeTile({ kid, selected, delay }) {
  return (
    <div
      className={[
        'ws-app-pop overflow-hidden rounded-[18px] border bg-white',
        selected ? 'border-[color:var(--ws-ui-accent)] shadow-earthy-card' : 'border-[color:var(--ws-ui-border)]',
      ].join(' ')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="ws-theme-tile-art h-16 overflow-hidden">
        <picture>
          <source
            type="image/webp"
            srcSet={`/theme-banners/${kid.banner}-376w.webp 376w, /theme-banners/${kid.banner}-768w.webp 768w`}
            sizes="240px"
          />
          <img src={`/theme-banners/${kid.banner}.png`} alt="" className="h-full w-full object-cover" loading="eager" decoding="async" />
        </picture>
      </div>
      <div className="flex items-center gap-2 p-3">
        <span className="text-xl" aria-hidden>{kid.emoji}</span>
        <div>
          <p className="ws-ui-title text-[15px] font-black">{kid.name}</p>
          <p className="ws-ui-muted text-[11px] font-black">{kid.done}/{kid.total} today</p>
        </div>
      </div>
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-[14px] bg-[color:var(--ws-ui-surface-muted)] px-2.5 py-2">
        <span className="text-base" aria-hidden>{kid.buddyEmoji}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-black text-[color:var(--ws-ui-text-secondary)]">
          {kid.buddy}
        </span>
        {selected ? (
          <span className="rounded-full bg-[color:var(--ws-ui-accent)] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.06em] text-white">
            Active
          </span>
        ) : null}
      </div>
    </div>
  )
}

function TaskRow({ task, delay }) {
  return (
    <div
      className="ws-ui-soft-card ws-app-pop flex min-h-[62px] items-center gap-3 rounded-[18px] px-3 py-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl">
        {task.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="ws-ui-title truncate text-[16px] font-black">{task.label}</p>
        <p className="ws-ui-muted truncate text-[11px] font-extrabold">Tap this row for a star</p>
      </div>
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[15px] font-black',
          task.done ? 'ws-app-task-on border-[color:var(--ws-ui-accent-muted)] text-[color:var(--ws-ui-text)]' : 'border-[color:var(--ws-ui-accent-muted)] text-transparent',
        ].join(' ')}
      >
        {task.done ? '✓' : '○'}
      </span>
    </div>
  )
}

function WeekStrip() {
  const days = [
    ['M', '11', '0'],
    ['T', '12', '0'],
    ['W', '13', '7'],
    ['T', '14', '✓'],
    ['F', '15', '0'],
    ['S', '16', '0'],
    ['S', '17', '0'],
  ]
  return (
    <div className="ws-week-strip">
      {days.map(([day, date, count], index) => (
        <div
          key={`${day}-${date}`}
          className={[
            'ws-app-pop ws-week-day',
            index === 6 ? 'ws-week-day-current' : '',
          ].join(' ')}
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <p className="text-[12px] font-black">{day}</p>
          <p className="text-[10px] font-black opacity-75">{date}</p>
          <p className="ws-week-count">
            {count}
          </p>
          {index === 6 ? <p className="mt-0.5 text-[8px] font-black">Today</p> : null}
        </div>
      ))}
    </div>
  )
}

function CelebrationLine({ icon, title, meta, delay }) {
  return (
    <div className="ws-app-pop mt-3 flex items-center gap-3" style={{ animationDelay: `${delay}ms` }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg">{icon}</span>
      <div className="min-w-0">
        <p className="ws-ui-title truncate text-[13px] font-black">{title}</p>
        <p className="ws-ui-muted truncate text-[11px] font-extrabold">{meta}</p>
      </div>
    </div>
  )
}

function ProgressBadge({ value, label }) {
  return (
    <div className="ws-ui-badge rounded-[20px] border px-3 py-2 text-center">
      <p className="text-[18px] font-black leading-none">{value}</p>
      <p className="mt-0.5 text-[10px] font-black leading-none">{label}</p>
    </div>
  )
}

function ProgressTrack({ width, small = false }) {
  return (
    <div className={`ws-ui-progress ${small ? 'mt-3 h-2' : 'h-3'} overflow-hidden rounded-full border`}>
      <div className="ws-ui-progress-fill ws-app-fill h-full rounded-full" style={{ width }} />
    </div>
  )
}

function onboardingBanner(name) {
  return {
    src: `/onboarding-art/${name}.png`,
    webp: `/onboarding-art/${name}-376w.webp 376w, /onboarding-art/${name}-768w.webp 768w, /onboarding-art/${name}-1440w.webp 1440w`,
    position: 'center 44%',
  }
}

function themeBanner(name) {
  return {
    src: `/theme-banners/${name}.png`,
    webp: `/theme-banners/${name}-376w.webp 376w, /theme-banners/${name}-768w.webp 768w, /theme-banners/${name}-1500w.webp 1500w`,
    position: 'center',
    crop: 'theme',
  }
}
