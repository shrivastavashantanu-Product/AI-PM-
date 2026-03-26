import { useState } from 'react'
import { getApiKey, setApiKey } from '../../lib/claudeAgent'

interface Props {
  onSaved: () => void
}

export default function ApiKeyPrompt({ onSaved }: Props) {
  const [key, setKey] = useState(getApiKey())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const trimmed = key.trim()
    if (!trimmed) return
    setApiKey(trimmed)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onSaved()
    }, 800)
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-amber-400 text-lg">🔑</span>
        <div>
          <p className="text-sm font-medium text-amber-300">Anthropic API Key Required</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Enter your API key to enable AI agents. It will be stored in your browser's localStorage — never sent anywhere except directly to Anthropic.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-ant-api03-..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}
