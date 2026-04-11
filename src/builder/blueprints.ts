import type { Blueprint } from './types'

export const BLUEPRINTS: Blueprint[] = [
  {
    type: 'SimulatedButton',
    label: 'Button',
    icon: '🔘',
    defaultProps: { variant: 'primary', label: 'New Button' },
  },
  {
    type: 'SimulatedTitle',
    label: 'Title / Heading',
    icon: '🔤',
    defaultProps: { system: 'salt', level: 'h2', text: 'New Heading' },
  },
  {
    type: 'SimulatedInput',
    label: 'Text Input',
    icon: '✏️',
    defaultProps: { placeholder: 'Enter text...', label: 'Label' },
  },
  {
    type: 'SimulatedAlert',
    label: 'Alert',
    icon: '⚠️',
    defaultProps: { variant: 'info', message: 'This is an alert message.' },
  },
]
