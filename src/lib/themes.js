// Re-export from the shared package. Keeps existing import paths stable.
export {
  THEMES,
  PET_CHAINS,
  PET_ASSET,
  EGG_NAMES,
  DEFAULT_ACTIVITIES,
  KID_AVATARS,
  ACTIVE_CHAIN_KEYS,
  HATCH_GOAL,
  stageToChainIdx,
  progressToStage,
  chainFor,
  pickFreshChain,
  assignChainsForBoard,
  petAtStage,
  adultPet,
  animatedFluentUrl,
  ACTIVITY_COLORS,
  ACTIVITY_EMOJIS,
  ACTIVITY_PRESETS,
} from '@weekly-superstar/shared/themes'

export { isBirthdayWeek } from '@weekly-superstar/shared/week'
