function Seal({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" stroke="#C6A15B" strokeWidth="1" />
      <circle cx="20" cy="20" r="15.5" stroke="#C6A15B" strokeWidth="0.5" opacity="0.5" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="14" fill="#E0BC7C">
        FT
      </text>
    </svg>
  )
}

export default Seal
