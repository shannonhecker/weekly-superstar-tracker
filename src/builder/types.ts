export type BlockType =
  | 'SimulatedButton'
  | 'SimulatedTitle'
  | 'SimulatedTextInput'
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
