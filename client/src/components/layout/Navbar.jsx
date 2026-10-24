import { useSelector } from 'react-redux'

function getGreeting() {
  let hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getTodayDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function Navbar({ onMenuClick }) {
  let { user } = useSelector((state) => state.auth)

  let initials = '·'
  if (user && user.name) {
    initials = user.name.trim().slice(0, 1).toUpperCase()
  }

  let handleToggleMenu = () => {
    if (onMenuClick) {
      onMenuClick()
    }
  }

  return (
    <header className="border-b border-hairline bg-ink/80 backdrop-blur">
      <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleToggleMenu} className="text-bone lg:hidden shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="eyebrow truncate">{getTodayDate()}</p>
            <h1 className="font-display text-lg sm:text-xl text-bone mt-1 truncate">
              {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-bone">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            <div className="h-9 w-9 rounded-full border border-brass/50 flex items-center justify-center font-display text-sm text-brass-bright">
              {initials}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
