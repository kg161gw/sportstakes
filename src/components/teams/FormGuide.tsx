export default function FormGuide({ form }: { form?: string | null }) {
  if (!form) return null
  const results = form.slice(-5).split('')
  return (
    <div className="flex gap-1">
      {results.map((r, i) => (
        <span
          key={i}
          className={`w-6 h-6 rounded text-xs font-heading flex items-center justify-center ${
            r === 'W' ? 'bg-win text-white' :
            r === 'L' ? 'bg-loss text-white' :
            'bg-draw text-black'
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  )
}
