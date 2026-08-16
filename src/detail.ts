import type { SpiralItem } from './content'

type Listener = (item: SpiralItem | null) => void

let current: SpiralItem | null = null
const listeners = new Set<Listener>()

export function openDetail(item: SpiralItem) {
  current = item
  listeners.forEach((fn) => fn(current))
}

export function closeDetail() {
  current = null
  listeners.forEach((fn) => fn(null))
}

export function getDetail() {
  return current
}

export function subscribeDetail(fn: Listener) {
  listeners.add(fn)
  fn(current)
  return () => {
    listeners.delete(fn)
  }
}

export function isDetailOpen() {
  return current !== null
}
