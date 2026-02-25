export function toggleClass(active: boolean): string {
  return active
    ? 'bg-purple-500 text-white'
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}

interface SettingsToggleProps {
  value: boolean
  onLabel: string
  offLabel: string
  onChange: (value: boolean) => void
  onClose: () => void
  disabled?: boolean
}

export function SettingsToggle({
  value,
  onLabel,
  offLabel,
  onChange,
  onClose,
  disabled,
}: SettingsToggleProps) {
  return (
    <div className="flex gap-1 px-2 pb-2">
      <button
        onClick={() => { onChange(true); onClose() }}
        disabled={disabled}
        className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${disabled ? 'bg-gray-800 text-gray-500' : toggleClass(value)}`}
      >
        {onLabel}
      </button>
      <button
        onClick={() => { onChange(false); onClose() }}
        className={`flex-1 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${toggleClass(!value)}`}
      >
        {offLabel}
      </button>
    </div>
  )
}
