export type BlockType =
  | 'SimulatedButton'
  | 'SimulatedTitle'
  | 'SimulatedInput'
  | 'SimulatedAlert'

export interface Block {
  id: string
  type: BlockType
  props: Record<string, string>
}

export interface Blueprint {
  type: BlockType
  label: string
  icon: string
  defaultProps: Record<string, string>
}

export type Theme = 'light' | 'dark'
export type Density = 'comfortable' | 'compact'

export interface GlobalSettings {
  theme: Theme
  density: Density
}
