export interface CanonicalEmotion {
  id: string
  label: { ro: string; en: string }
  description: { ro: string; en: string }
  needs: { ro: string; en: string }
  color: string
  distressTier?: 'watch' | 'high'
}
