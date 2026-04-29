import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { colors } from '@weekly-superstar/shared/tokens'
import { THEMES, EGG_NAMES, PET_CHAINS, PET_ASSET, chainFor, petAtStage, stageToChainIdx, progressToStage, HATCH_GOAL } from '../lib/themes'
import Modal from './Modal'
import { getWeekKey } from '../lib/week'
import { useToast } from '../contexts/ToastContext'
import { celebrate } from '../lib/confetti'
import { play } from '../lib/sounds'
import Egg from './Egg'
import PromptModal from './PromptModal'
import PetGallery from './PetGallery'

function stageMessage(stage, petName, remaining) {
  // Subtitles stand alone — the title already shows the pet's name + form, so
  // we keep this to a short mood phrase ("snoozing 💤") instead of repeating.
  switch (stage) {
    case 0: return `${remaining} stars to hatch`
    case 1: return 'Snoozing 💤'
    case 2: return 'Growing 🌱'
    case 3: return 'Happy 😊'
    case 4: return 'Buzzing ✨'
    case 5: return 'Getting cool 😎'
    case 6: return '🎉 All grown!'
    default: return `${remaining} stars to hatch`
  }
}

function stageTitle(stage, petName, eggName, kidName, savedPetName) {
  if (stage === 0) return eggName
  if (stage === 6) return savedPetName || `${kidName}'s ${petName}`
  const pn = petName || 'pet'
  if (stage === 1) return `Baby ${pn}`
  if (stage === 2) return `Growing ${pn}`
  if (stage === 3) return `Young ${pn}`
  if (stage === 4) return `Strong ${pn}`
  if (stage === 5) return `Cool ${pn}`
  return pn
}

function MysteryPet({ kid, totalStars, boardId, assignedChain, onOpenSummary }, ref) {
  const theme = THEMES[kid.theme] || THEMES.football
  const eggName = EGG_NAMES[kid.theme] || 'Mystery Egg'
  const thisWeekKey = getWeekKey()
  const weekKey = kid.weekKey || thisWeekKey
  // Prefer the persisted chainKey on the kid doc when it's for THIS week
  // (Board will upsert it on load). Fall back to the board-wide assignment,
  // then a per-kid hash. Ignoring a stale chainKey from a prior week avoids
  // briefly showing last week's species before the upsert propagates.
  const persistedChainKey = kid.weekKey === thisWeekKey ? kid.chainKey : null
  const chainKey = persistedChainKey || assignedChain || chainFor(kid.id, thisWeekKey)
  const stage = progressToStage(totalStars, HATCH_GOAL)
  const { emoji: petEmoji, name: petDisplayName } = petAtStage(chainKey, stage)
  const isHatched = totalStars >= HATCH_GOAL
  const petName = kid.petName
  const petNameDeclined = kid.petNameDeclined
  const remaining = Math.max(0, HATCH_GOAL - totalStars)
  const [modalOpen, setModalOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [levelUp, setLevelUp] = useState(false)
  const [evolution, setEvolution] = useState(null) // { from, to, emoji, kind: 'hatch'|'evolve'|'adult' }
  const prevStageRef = useRef(stage)
  const chain = PET_CHAINS[chainKey] || PET_CHAINS.cats
  const chainIdx = stageToChainIdx(stage, chain.stages.length)
  const prevChainIdxRef = useRef(chainIdx)
  const toast = useToast()

  // Reset stage/chain refs when the week changes so last week's values don't
  // leak into this week's level-up and evolution effects.
  useEffect(() => {
    prevStageRef.current = stage
    prevChainIdxRef.current = chainIdx
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey, chainKey])

  useImperativeHandle(ref, () => ({
    openGallery: () => setGalleryOpen(true),
  }))

  useEffect(() => {
    if (!isHatched) return
    celebrate('hatch', { origin: { x: 0.5, y: 0.35 } })
    play('hatch')
  }, [isHatched])

  // Stage-transition "level-up" burst — fires on any stage increase (except 0→1 on page load).
  useEffect(() => {
    const prev = prevStageRef.current
    if (stage > prev && prev > 0) {
      setLevelUp(true)
      celebrate('badge', { origin: { x: 0.5, y: 0.4 } })
      play('badge')
      const t = setTimeout(() => setLevelUp(false), 900)
      prevStageRef.current = stage
      return () => clearTimeout(t)
    }
    prevStageRef.current = stage
  }, [stage])

  // Evolution popup — fires when the pet's form in the chain changes, or on first hatch.
  // Ignored on the very first render (prev === current) so we don't pop on page load.
  useEffect(() => {
    const prevIdx = prevChainIdxRef.current
    if (chainIdx > prevIdx) {
      const fromName = chain.names[prevIdx] || 'baby'
      const toName = chain.names[chainIdx] || petDisplayName
      setEvolution({
        kind: chainIdx === chain.stages.length - 1 ? 'adult' : 'evolve',
        from: fromName,
        to: toName,
        emoji: chain.stages[chainIdx],
      })
      celebrate('hatch', { origin: { x: 0.5, y: 0.4 } })
      play('hatch')
    } else if (prevIdx === 0 && chainIdx === 0 && stage === 1 && prevStageRef.current === 0) {
      // Very first crack of the egg — show hatching celebration even though chain idx is still 0.
      setEvolution({
        kind: 'hatch',
        from: null,
        to: chain.names[0] || petDisplayName,
        emoji: chain.stages[0],
      })
    }
    prevChainIdxRef.current = chainIdx
  }, [chainIdx])

  // Open the naming prompt when the egg FIRST cracks open (stage 1), not at full grown.
  // Gated on !evolution so the growth-celebration popup shows first.
  //
  // `chainKey` is in the deps so a chain transition (Monday rollover →
  // pickFreshChain assigns a new species) re-evaluates whether the modal should
  // fire. Suspected race: if Board.jsx's rollover write sets `chainKey: picked`
  // but `petName: null` doesn't land (or arrives in a separate snapshot), this
  // effect would skip on the stale `petName`. Don't auto-clear `petName` here
  // — that could overwrite a legitimate name. If the modal fails to re-fire on
  // chain transition, check the `[Board] rollover update` console log to verify
  // the rollover write succeeded.
  const hasHatched = stage >= 1
  useEffect(() => {
    if (!hasHatched || petName || petNameDeclined || evolution) return
    const t = setTimeout(() => setModalOpen(true), 900)
    return () => clearTimeout(t)
  }, [hasHatched, petName, petNameDeclined, evolution, chainKey])

  const submitName = async (name) => {
    setModalOpen(false)
    const trimmed = (name || '').trim()
    if (!trimmed) {
      // Cancel or empty — remember the decline so we don't nag
      try {
        await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), { petNameDeclined: true })
      } catch (e) { toast.error('Could not save — try again') }
      return
    }
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), { petName: trimmed })
    } catch (e) { toast.error('Could not save pet name — try again') }
  }

  const dismissModal = async () => {
    setModalOpen(false)
    try {
      await updateDoc(doc(db, 'boards', boardId, 'kids', kid.id), { petNameDeclined: true })
    } catch {}
  }

  const openGallery = () => setGalleryOpen(true)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openGallery}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGallery() } }}
        className="rounded-2xl p-3 flex items-center gap-3 h-full overflow-hidden w-full text-left active:scale-[0.98] transition-transform cursor-pointer shadow-earthy-card font-jakarta"
        style={{ backgroundColor: colors.earthy.card, border: `1px solid ${theme.accent}55` }}
      >
        <div
          className={`relative shrink-0 flex items-center justify-center overflow-hidden ${levelUp ? 'level-up-burst' : ''}`}
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: `${theme.accent}22`,
            border: `1px solid ${theme.accent}44`,
          }}
        >
          <div
            aria-hidden
            className="absolute left-[-14px] right-[-14px] bottom-[-20px] h-[38px] rounded-full"
            style={{ backgroundColor: `${theme.accent}33` }}
          />
          <Egg
            themeKey={kid.theme || 'dinosaur'}
            accent={theme.accent}
            totalStars={totalStars}
            max={HATCH_GOAL}
            petEmoji={petEmoji}
            size={64}
          />
          <span
            aria-hidden
            className="absolute right-2 top-1.5 text-xs"
            style={{ color: theme.deeper }}
          >
            ✦
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase" style={{ color: theme.deeper }}>
            {kid.name}'s Mystery Pet
          </div>
          <div className="text-base font-extrabold truncate text-earthy-cocoa">
            {stageTitle(stage, petDisplayName, eggName, kid.name, petName)}
          </div>
          <div className="text-[11px] italic mt-0.5 truncate" style={{ color: theme.deeper, opacity: 0.85 }}>
            {stage === 0
              ? `${remaining} stars to hatch`
              : stage === 6
                ? '🎉 Fully grown!'
                : stageMessage(stage, petDisplayName, remaining)}
          </div>
        </div>
      </div>

      {/* Modals are siblings of the card, NOT children, so taps on the input
          don't bubble to the card's click handler. */}
      <PromptModal
        open={modalOpen}
        onClose={dismissModal}
        onSubmit={submitName}
        emoji={petEmoji}
        emojiClassName="text-7xl mb-3 leading-none"
        title={`${kid.name}'s pet hatched!`}
        submitLabel="Name it"
        cancelLabel="Skip"
        fields={[{
          name: 'name',
          label: `Give ${petEmoji} a name`,
          placeholder: 'e.g. Sunny',
          defaultValue: petName || eggName.replace(' Egg', ''),
        }]}
      />
      <PetGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        kid={kid}
        currentPet={petEmoji}
        currentChainKey={chainKey}
        currentStage={stage}
        currentEggName={eggName}
        boardId={boardId}
        onRename={() => setModalOpen(true)}
        onOpenSummary={onOpenSummary ? (weekKey, archive) => {
          setGalleryOpen(false)
          onOpenSummary(weekKey, archive)
        } : undefined}
      />

      {/* Evolution / growth celebration popup */}
      <Modal
        open={!!evolution}
        onClose={() => setEvolution(null)}
        emoji={evolution?.kind === 'hatch' ? '🎉' : evolution?.kind === 'adult' ? '🏆' : '✨'}
        title={
          evolution?.kind === 'hatch'
            ? `${kid.name}'s egg cracked!`
            : evolution?.kind === 'adult'
              ? `${kid.name}'s pet is all grown!`
              : `${kid.name}'s pet grew up!`
        }
      >
        <div className="flex flex-col items-center py-4">
          {evolution?.emoji && (
            <img
              src={`https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis/${
                PET_ASSET[evolution.emoji]
                  ? encodeURIComponent(PET_ASSET[evolution.emoji][0]) + '/' + encodeURIComponent(PET_ASSET[evolution.emoji][1])
                  : ''
              }.png`}
              alt=""
              width={120}
              height={120}
              className="hatch-reveal drop-shadow-md"
              draggable={false}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          )}
          <div className="text-center mt-3 text-earthy-cocoa font-bold">
            {evolution?.kind === 'hatch'
              ? `Meet your baby ${evolution?.to} ${evolution?.emoji || ''}`
              : evolution?.kind === 'adult'
                ? `Your ${evolution?.from} is now a full-grown ${evolution?.to}! ${evolution?.emoji || ''}`
                : `Your ${evolution?.from} grew into a ${evolution?.to}! ${evolution?.emoji || ''}`}
          </div>
        </div>
        <button
          onClick={() => setEvolution(null)}
          style={{ color: '#FFFAF0', backgroundColor: '#5A3A2E' }}
          className="w-full py-3 rounded-pill font-bold hover:bg-[#4A2E25] active:scale-[0.99] transition-all"
        >
          Yay!
        </button>
      </Modal>
    </>
  )
}

export default forwardRef(MysteryPet)
