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

const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
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
