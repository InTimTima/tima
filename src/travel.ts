export type NavId = 'info' | 'stack' | 'projects' | 'contact'

type Seeker = (index: number) => void

let seeker: Seeker | null = null
let active: NavId = 'info'
const listeners = new Set<(id: NavId) => void>()

export function registerSeeker(fn: Seeker) {
  seeker = fn
  return () => {
    if (seeker === fn) seeker = null
  }
}

export function goToIndex(index: number) {
  seeker?.(index)
}

export function setActiveNav(id: NavId) {
  if (active === id) return
  active = id
  listeners.forEach((fn) => fn(id))
}

export function getActiveNav() {
  return active
}

export function subscribeNav(fn: (id: NavId) => void) {
  listeners.add(fn)
  fn(active)
  return () => {
    listeners.delete(fn)
  }
}
