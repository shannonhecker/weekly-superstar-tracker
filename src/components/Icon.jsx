import {
  MdMoreHoriz,
  MdShare,
  MdSave,
  MdCalendarToday,
  MdDelete,
  MdEdit,
  MdLogout,
  MdVolumeUp,
  MdVolumeOff,
  MdEmojiEvents,
  MdChecklist,
  MdPrint,
  MdRedeem,
  MdClose,
  MdArrowBack,
} from 'react-icons/md'

// Curated Material-icon registry. Keep this list short — every icon
// added here ships in the bundle (tree-shaking is per-icon at the
// react-icons import level, but each entry adds a small chunk).
//
// Used ONLY for *interactive* affordances (buttons, menu triggers,
// toolbar actions). Content emojis (kid avatars, theme tiles, sticker
// celebrations, modal-title decorations) stay as native emoji — they
// are part of the kid-facing brand voice.
const ICONS = {
  'menu-more': MdMoreHoriz,
  share: MdShare,
  save: MdSave,
  calendar: MdCalendarToday,
  delete: MdDelete,
  edit: MdEdit,
  'sign-out': MdLogout,
  'volume-on': MdVolumeUp,
  'volume-off': MdVolumeOff,
  trophy: MdEmojiEvents,
  tasks: MdChecklist,
  print: MdPrint,
  reward: MdRedeem,
  close: MdClose,
  back: MdArrowBack,
}

export default function Icon({ name, size = 20, className = '', style, ...rest }) {
  const Cmp = ICONS[name]
  if (!Cmp) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(`[Icon] Unknown icon "${name}"`)
    }
    return null
  }
  return <Cmp size={size} aria-hidden="true" className={className} style={style} {...rest} />
}
