let tones = {
  slate: 'text-bone',
  green: 'text-jade',
  red: 'text-wine',
  blue: 'text-denim',
  gold: 'text-brass-bright'
}

function SummaryCard({ label, value, tone = 'slate' }) {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-5">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 font-display text-2xl sm:text-3xl tnum ${tones[tone]}`}>{value}</p>
    </div>
  )
}

export default SummaryCard
