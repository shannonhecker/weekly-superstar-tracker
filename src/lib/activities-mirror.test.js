import { describe, it, expect } from 'vitest'
import { mirrorActivitiesForKid } from './activities-mirror'

const a = (id, label, extra = {}) => ({ id, label, emoji: '⭐', color: '#fff', ...extra })

describe('mirrorActivitiesForKid', () => {
  it('returns the source order verbatim when target is empty', () => {
    const source = [a('s1', 'Sleep'), a('s2', 'Read')]
    expect(mirrorActivitiesForKid([], source)).toEqual(source)
  })

  it('preserves target IDs for labels that exist in both lists', () => {
    const target = [a('t-sleep-old', 'Sleep'), a('t-bath-old', 'Bath')]
    const source = [a('s-bath', 'Bath'), a('s-sleep', 'Sleep')]
    const result = mirrorActivitiesForKid(target, source)
    expect(result).toEqual([
      a('t-bath-old', 'Bath'),    // ID kept from target
      a('t-sleep-old', 'Sleep'),  // ID kept from target
    ])
  })

  it('uses source ID for labels new to the target', () => {
    const target = [a('t-sleep', 'Sleep')]
    const source = [a('s-sleep', 'Sleep'), a('s-read', 'Read')]
    const result = mirrorActivitiesForKid(target, source)
    expect(result).toEqual([
      a('t-sleep', 'Sleep'),  // preserved
      a('s-read', 'Read'),    // adopted from source
    ])
  })

  it('drops target activities not in source (lossy by design)', () => {
    const target = [a('t-sleep', 'Sleep'), a('t-brush', 'Brush teeth')]
    const source = [a('s-sleep', 'Sleep'), a('s-read', 'Read')]
    const result = mirrorActivitiesForKid(target, source)
    expect(result.map((x) => x.label)).toEqual(['Sleep', 'Read'])
  })

  it('mirrors order, emoji, and color from source', () => {
    const target = [a('t-sleep', 'Sleep', { emoji: '🌙', color: '#aaa' })]
    const source = [a('s-sleep', 'Sleep', { emoji: '😴', color: '#bbb' })]
    const result = mirrorActivitiesForKid(target, source)
    expect(result[0]).toEqual({ id: 't-sleep', label: 'Sleep', emoji: '😴', color: '#bbb' })
  })

  it('matches labels case-insensitively and trims whitespace', () => {
    const target = [a('t-1', '  sleep  '), a('t-2', 'Read')]
    const source = [a('s-1', 'Sleep'), a('s-2', 'READ')]
    const result = mirrorActivitiesForKid(target, source)
    expect(result.map((x) => x.id)).toEqual(['t-1', 't-2'])
  })

  it('does not match empty labels (treats both as new)', () => {
    const target = [a('t-empty-1', '')]
    const source = [a('s-empty-2', '')]
    const result = mirrorActivitiesForKid(target, source)
    expect(result).toEqual([a('s-empty-2', '')])
  })

  it('handles duplicate labels in target by keeping the first occurrence', () => {
    const target = [a('t-1', 'Read'), a('t-2', 'Read')]
    const source = [a('s-1', 'Read')]
    const result = mirrorActivitiesForKid(target, source)
    expect(result).toEqual([a('t-1', 'Read')])
  })

  it('returns empty array when source is empty (mirrors deletion-of-all)', () => {
    expect(mirrorActivitiesForKid([a('t-1', 'Sleep')], [])).toEqual([])
  })

  it('tolerates non-array inputs', () => {
    expect(mirrorActivitiesForKid(undefined, undefined)).toEqual([])
    expect(mirrorActivitiesForKid(null, [a('s', 'S')])).toEqual([a('s', 'S')])
  })
})
