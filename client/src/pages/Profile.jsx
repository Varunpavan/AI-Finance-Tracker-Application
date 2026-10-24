import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfileThunk, deleteAccountThunk } from '../redux/slices/authSlice'
import { changePassword, getAccountStats } from '../services/authService'
import { formatCurrency } from '../utils/format'

let inputClass =
  'w-full bg-surface border border-hairline rounded-md px-3 py-2 text-sm text-bone focus:outline-none focus:border-brass transition-colors'

function Profile() {
  let dispatch = useDispatch()
  let navigate = useNavigate()
  let { user } = useSelector((state) => state.auth)

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [stats, setStats] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    let fetchData = async () => {
      if (user) {
        setProfile({ name: user.name, email: user.email })
      }

      try {
        let res = await getAccountStats()
        setStats(res.data.data)
      } catch (err) {
        console.log(err)
      }
    }

    fetchData()
  }, [user])

  let handleNameChange = (event) => {
    setProfile({ ...profile, name: event.target.value })
  }

  let handleEmailChange = (event) => {
    setProfile({ ...profile, email: event.target.value })
  }

  let handleCurrentPasswordChange = (event) => {
    setPasswords({ ...passwords, currentPassword: event.target.value })
    setPasswordError('')
    setPasswordMessage('')
  }

  let handleNewPasswordChange = (event) => {
    setPasswords({ ...passwords, newPassword: event.target.value })
    setPasswordError('')
    setPasswordMessage('')
  }

  let handleToggleCurrentPasswordClick = () => {
    setShowCurrentPassword((prev) => !prev)
  }

  let handleToggleNewPasswordClick = () => {
    setShowNewPassword((prev) => !prev)
  }

  let handleProfileSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      await dispatch(updateProfileThunk(profile)).unwrap()
      setMessage('Profile updated.')
    } catch (err) {
      console.log(err)
      setError(err || 'Unable to update profile.')
    }
  }

  let handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    let current = passwords.currentPassword.trim()
    let next = passwords.newPassword.trim()

    if (current === next) {
      setPasswordError('New password must be different from current password.')
      return
    }

    if (next.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    setPasswordLoading(true)

    try {
      let res = await changePassword({ currentPassword: current, newPassword: next })
      setPasswords({ currentPassword: '', newPassword: '' })
      setPasswordMessage(res.data?.message || 'Password changed successfully.')
    } catch (err) {
      console.log(err)
      setPasswordError(err.response?.data?.message || 'Unable to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  let handleDeleteAccountClick = async () => {
    let confirmed = window.confirm(
      'Are you sure you want to delete your account? All your transactions, budget settings, and records will be permanently deleted.'
    )
    if (!confirmed) {
      return
    }

    try {
      await dispatch(deleteAccountThunk()).unwrap()
      navigate('/login')
    } catch (err) {
      console.log(err)
      setError(err || 'Failed to delete account.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h2 className="font-display text-3xl text-bone">Profile</h2>
      </div>

      {message && <div className="rounded-md border border-jade/40 bg-jade/10 p-3 text-sm text-jade">{message}</div>}
      {error && <div className="rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-4 sm:p-6 xl:col-span-2">
          <p className="eyebrow mb-1">Details</p>
          <h3 className="font-display text-lg text-bone mb-5">User Details</h3>
          <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              value={profile.name}
              onChange={handleNameChange}
              className={inputClass}
              placeholder="Name"
              required
            />
            <input
              type="email"
              value={profile.email}
              onChange={handleEmailChange}
              className={inputClass}
              placeholder="Email"
              required
            />
            <button className="rounded-md bg-brass px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brass-bright transition-colors md:w-max">
              Save Profile
            </button>
          </form>

          <div className="my-8 h-px bg-hairline" />

          <p className="eyebrow mb-1">Security</p>
          <h3 className="font-display text-lg text-bone mb-5">Change Password</h3>

          {passwordMessage && (
            <div className="mb-4 rounded-md border border-jade/40 bg-jade/10 p-3 text-sm text-jade">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={handleCurrentPasswordChange}
                className={`${inputClass} pr-14`}
                placeholder="Current password"
                required
              />
              <button
                type="button"
                onClick={handleToggleCurrentPasswordClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-bone transition-colors"
              >
                {showCurrentPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                autoComplete="new-password"
                minLength="6"
                value={passwords.newPassword}
                onChange={handleNewPasswordChange}
                className={`${inputClass} pr-14`}
                placeholder="New password"
                required
              />
              <button
                type="button"
                onClick={handleToggleNewPasswordClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-bone transition-colors"
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-md border border-hairline px-4 py-2.5 text-sm font-semibold text-bone hover:border-brass/40 transition-colors md:w-max disabled:opacity-50"
            >
              {passwordLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div className="my-8 h-px bg-hairline" />

          <p className="eyebrow mb-1">Danger Zone</p>
          <h3 className="font-display text-lg text-bone mb-2">Delete Account</h3>
          <p className="text-xs text-muted mb-4">
            Permanently delete your profile and wipe all transactions and budget history.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccountClick}
            className="rounded-md border border-wine/40 bg-wine/10 px-4 py-2.5 text-sm font-semibold text-wine hover:bg-wine hover:text-white transition-colors md:w-max"
          >
            Delete Account
          </button>
        </section>

        <section className="card p-4 sm:p-6">
          <p className="eyebrow mb-1">Summary</p>
          <h3 className="font-display text-lg text-bone mb-5">Account Statistics</h3>
          <div className="divide-y divide-hairsoft">
            <div className="py-3 first:pt-0">
              <p className="eyebrow">Transactions</p>
              <p className="font-display text-2xl tnum text-bone mt-1">{stats?.transactionCount || 0}</p>
            </div>
            <div className="py-3">
              <p className="eyebrow">Income</p>
              <p className="font-display text-xl tnum text-jade mt-1">{formatCurrency(stats?.totalIncome)}</p>
            </div>
            <div className="py-3">
              <p className="eyebrow">Expenses</p>
              <p className="font-display text-xl tnum text-wine mt-1">{formatCurrency(stats?.totalExpense)}</p>
            </div>
            <div className="py-3 last:pb-0">
              <p className="eyebrow">Savings</p>
              <p className="font-display text-xl tnum text-bone mt-1">{formatCurrency(stats?.savings)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Profile
