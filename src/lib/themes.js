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
  isRareChain,
  assignChainsForBoard,
  petAtStage,
  adultPet,
  animatedFluentUrl,
} from '@weekly-superstar/shared/themes'

export { isBirthdayWeek } from '@weekly-superstar/shared/week'
