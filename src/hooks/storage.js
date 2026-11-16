// localStorage can be missing or throw (private mode, sandboxed frames).
// The site must work without it, so every access is guarded.
export const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
}
