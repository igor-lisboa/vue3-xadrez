import { describe, expect, it } from 'vitest'
import { isIosDevice, isStandaloneDisplay } from '@/domain/install'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
const IPAD_DESKTOP_MODE = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0'

describe('isIosDevice', () => {
  it('recognises iPhone and iPod user agents', () => {
    expect(isIosDevice(IPHONE, 5)).toBe(true)
    expect(isIosDevice('Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0)', 5)).toBe(true)
  })

  it('recognises an iPad that asks for the desktop site, by its touch screen', () => {
    expect(isIosDevice(IPAD_DESKTOP_MODE, 5)).toBe(true)
    expect(isIosDevice(IPAD_DESKTOP_MODE, 0)).toBe(false)
  })

  it('is false for Android and desktop browsers', () => {
    expect(isIosDevice(ANDROID, 5)).toBe(false)
    expect(isIosDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0)).toBe(false)
  })
})

describe('isStandaloneDisplay', () => {
  it('is true when either the display mode or the iOS flag says the app is installed', () => {
    expect(isStandaloneDisplay(true, false)).toBe(true)
    expect(isStandaloneDisplay(false, true)).toBe(true)
    expect(isStandaloneDisplay(false, false)).toBe(false)
  })
})
