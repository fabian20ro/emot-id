import '@testing-library/jest-dom'

class MockAudioContext {
  state = 'running'
  resume() {
    return Promise.resolve()
  }
  createOscillator() {
    return {
      connect: () => {},
      type: 'sine',
      frequency: { value: 0 },
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      connect: () => {},
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    }
  }
  destination = {}
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

const store = new Map<string, string>()

const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, String(value)) },
  removeItem: (key: string) => { store.delete(key) },
  clear: () => { store.clear() },
  get length(): number { return store.size },
  key: (index: number): string | null => {
    const keys = Array.from(store.keys())
    return index < keys.length ? keys[index] : null
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock navigator.language for language detection tests
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
})

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})
