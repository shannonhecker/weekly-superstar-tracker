import { describe, expect, it } from 'vitest'
import {
  makeIntlLocale,
  normalizeLanguageTag,
  normalizeRegionTag,
  resolveLocaleFromTags,
} from './i18n'

describe('i18n locale resolution', () => {
  it('normalizes supported language tags', () => {
    expect(normalizeLanguageTag('en-GB')).toBe('en')
    expect(normalizeLanguageTag('zh-TW')).toBe('zh-Hant')
    expect(normalizeLanguageTag('zh_HK')).toBe('zh-Hant')
    expect(normalizeLanguageTag('fr-FR')).toBe('fr')
    expect(normalizeLanguageTag('pt-BR')).toBeNull()
  })

  it('normalizes supported regions from language tags', () => {
    expect(normalizeRegionTag('en-GB')).toBe('GB')
    expect(normalizeRegionTag('zh-Hant-TW')).toBe('TW')
    expect(normalizeRegionTag('de-DE')).toBe('DE')
    expect(normalizeRegionTag('en-NZ')).toBeNull()
  })

  it('uses the first supported browser language and region', () => {
    expect(resolveLocaleFromTags(['pt-BR', 'fr-CA'])).toEqual({
      language: 'fr',
      region: 'CA',
    })
  })

  it('falls back to the default region for a language without a supported region', () => {
    expect(resolveLocaleFromTags(['de-AT'])).toEqual({
      language: 'de',
      region: 'DE',
    })
  })

  it('creates BCP 47 locale tags for Intl', () => {
    expect(makeIntlLocale('en', 'GB')).toBe('en-GB')
    expect(makeIntlLocale('zh-Hant', 'TW')).toBe('zh-Hant-TW')
  })
})
