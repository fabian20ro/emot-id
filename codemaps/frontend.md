# Frontend Codemap

> Freshness: 2026-02-01

## Components (src/components/)

| Component | File | Props | Local State | Key Behavior |
|-----------|------|-------|-------------|--------------|
| Header | Header.tsx | modelId, onModelChange | menuOpen | Toggles SettingsMenu |
| MenuButton | MenuButton.tsx | isOpen, onClick | - | Animated hamburger bars |
| SettingsMenu | SettingsMenu.tsx | isOpen, onClose, modelId, onModelChange | - | Language + model buttons, closes on selection |
| AnalyzeButton | AnalyzeButton.tsx | disabled, onClick | - | Disabled tooltip, pulse animation |
| SelectionBar | SelectionBar.tsx | selections[], combos[], onDeselect, onClear | - | Chip list + combo display, max-h-[30vh] scroll |
| BubbleField | BubbleField.tsx | emotions[], onSelect, sizes | containerSize, positions | ResizeObserver, collision detection, grid fallback |
| Bubble | Bubble.tsx | emotion, onClick, size, index, position | - | Color utils, spring animation, absolute positioned |
| ResultModal | ResultModal.tsx | isOpen, onClose, selections[], results[] | - | AI link with template interpolation |

## Hooks (src/hooks/)

| Hook | Signature | Returns |
|------|-----------|---------|
| useEmotionModel | (modelId: string) | { selections, visibleEmotions, sizes, combos, handleSelect, handleDeselect, handleClear, analyze } |
| useLocalStorage | <T>(key, initialValue) | [value, setValue] |
| useSound | () | { playSound: (type) => void } |

## Context (src/context/)

| Context | Provider | Hook | State |
|---------|----------|------|-------|
| LanguageContext | LanguageProvider | useLanguage() | language: 'ro'\|'en', setLanguage, t: Strings |
| ThemeContext | - | - | Dark theme only (currently unused) |

## Utility Functions (in Bubble.tsx)

| Function | Purpose |
|----------|---------|
| isValidHex(hex) | Validates #hex color format |
| adjustColor(hex, amount) | Brightens/darkens hex color |
| getContrastColor(hex) | Returns white or dark text for readability |

## Layout Strategy

- Root: `h-screen overflow-hidden flex flex-col` (viewport-locked)
- BubbleField: `flex-1 min-h-0` (compressible)
- SelectionBar: `max-h-[30vh] overflow-y-auto` (capped with scroll)
- Bubble positioning: absolute within relative container, collision-detected

## Animation Patterns

| Pattern | Usage | Library |
|---------|-------|---------|
| Spring physics | Bubble enter/exit, chip add/remove | Framer Motion |
| Layout animation | SelectionBar chip reflow | Framer Motion `layout` prop |
| AnimatePresence | Mount/unmount transitions | Framer Motion |
| Hamburger morph | MenuButton bars rotate to X | Framer Motion animate |

## Import Graph

```
App.tsx
├── Header.tsx → MenuButton.tsx, SettingsMenu.tsx
├── AnalyzeButton.tsx
├── SelectionBar.tsx
├── BubbleField.tsx → Bubble.tsx
├── ResultModal.tsx
├── useSound.ts
└── useEmotionModel.ts → registry.ts → models/*
```
