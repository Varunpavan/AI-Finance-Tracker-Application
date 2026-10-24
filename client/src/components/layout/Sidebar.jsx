import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { logoutServer } from '../../services/authService'
import Seal from '../brand/Seal'

let navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Budget', path: '/budget' },
  { label: 'Insights', path: '/insights' },
  { label: 'Reports', path: '/reports' },
  { label: 'Profile', path: '/profile' }
]

function Sidebar({ isOpen, onClose }) {
  let location = useLocation()
  let dispatch = useDispatch()
  let navigate = useNavigate()

  let isActive = (path) => {
    return location.pathname === path
  }

  let handleLogout = async () => {
    try {
      await logoutServer()
    } catch (err) {
      console.log(err)
    }
    dispatch(logout())
    navigate('/login')
  }

  let handleNavClick = () => {
    if (onClose) {
      onClose()
    }
  }

  let handleBackdropClick = () => {
    if (onClose) {
      onClose()
    }
  }

  let handleCloseButtonClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static z-50 lg:z-auto top-0 left-0 h-screen w-64 flex flex-col bg-ink border-r border-hairline transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-brass/40 to-transparent" />

        <div className="px-6 pt-8 pb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Seal size={36} />
            <div>
              <p className="font-display text-lg leading-none text-bone">FinTrack</p>
              <p className="eyebrow mt-1">Personal Ledger</p>
            </div>
          </div>

          <button onClick={handleCloseButtonClick} className="text-muted hover:text-bone lg:hidden">
            ✕
          </button>
        </div>

        <div className="mx-6 h-px bg-hairline" />

        <nav className="flex-1 px-4 pt-6 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-raised text-bone'
                  : 'text-muted hover:text-bone hover:bg-hairsoft'
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full transition-colors ${
                  isActive(item.path) ? 'bg-brass' : 'bg-transparent group-hover:bg-brass/50'
                }`}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-6 h-px bg-hairline" />

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full text-sm py-2.5 rounded-md border border-hairline text-muted hover:text-wine hover:border-wine/40 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
