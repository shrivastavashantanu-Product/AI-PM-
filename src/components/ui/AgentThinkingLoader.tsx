interface AgentThinkingLoaderProps {
  agentName: string
  color?: string
}

export default function AgentThinkingLoader({ agentName, color = 'indigo' }: AgentThinkingLoaderProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full bg-${color}-400`}
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        <span className={`text-${color}-400 font-medium`}>{agentName}</span> is analyzing...
      </span>
    </div>
  )
}
