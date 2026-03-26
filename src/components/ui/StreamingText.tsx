import { useEffect, useRef } from 'react'

interface StreamingTextProps {
  text: string
  isStreaming: boolean
  className?: string
}

export default function StreamingText({ text, isStreaming, className = '' }: StreamingTextProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [text])

  if (!text && !isStreaming) return null

  return (
    <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap text-indigo-100 ${className}`}>
      {text}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-indigo-400 ml-0.5 animate-blink align-text-bottom" />
      )}
      <div ref={endRef} />
    </div>
  )
}
