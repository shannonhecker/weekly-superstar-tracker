// Vitest setup — runs once before every test file.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Ensure each test starts with an empty DOM. Without this, components
// from one test leak into the next when render() is called repeatedly.
afterEach(() => {
  cleanup()
})
