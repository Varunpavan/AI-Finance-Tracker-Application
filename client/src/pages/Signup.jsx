import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signupUser } from '../redux/slices/authSlice'
import Seal from '../components/brand/Seal'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  let { loading } = useSelector((state) => state.auth)
  let navigate = useNavigate()
  let dispatch = useDispatch()

  let handleTogglePasswordClick = () => {
    setShowPassword((prev) => !prev)
  }

  let handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  let handleFormSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await dispatch(
        signupUser({ name: formData.name, email: formData.email, password: formData.password })
      ).unwrap()
      navigate('/dashboard')
    } catch (err) {
      console.log(err)
      setError(err || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 border-r border-hairline relative overflow-hidden">
        <div className="absolute inset-0 bg-grain" />
        <div className="relative">
          <Seal size={44} />
        </div>
        <div className="relative max-w-md">
          <p className="eyebrow mb-4">Open an account</p>
          <h1 className="font-display text-5xl leading-[1.05] text-bone">
            Start with <span className="text-brass-bright">one</span> entry.
          </h1>
          <p className="mt-6 text-muted leading-relaxed">
            A budget, a ledger, and a running read on where you stand — set up
            in under a minute.
          </p>
        </div>
        <div className="relative eyebrow">FinTrack — Personal Ledger</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <Seal size={36} />
            <p className="font-display text-lg">FinTrack</p>
          </div>

          <p className="eyebrow mb-2">New account</p>
          <h2 className="font-display text-3xl text-bone mb-8">Sign up</h2>

          {error && (
            <div className="mb-5 rounded-md border border-wine/40 bg-wine/10 px-4 py-3 text-sm text-wine">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div>
              <label className="eyebrow block mb-2">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-surface border border-hairline rounded-md px-4 py-2.5 text-bone placeholder:text-muted/60 focus:outline-none focus:border-brass transition-colors"
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-surface border border-hairline rounded-md px-4 py-2.5 text-bone placeholder:text-muted/60 focus:outline-none focus:border-brass transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="eyebrow block mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-hairline rounded-md px-4 py-2.5 pr-14 text-bone placeholder:text-muted/60 focus:outline-none focus:border-brass transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleTogglePasswordClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-bone transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="eyebrow block mb-2">Confirm</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-hairline rounded-md px-4 py-2.5 pr-14 text-bone placeholder:text-muted/60 focus:outline-none focus:border-brass transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleTogglePasswordClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-bone transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brass text-ink font-semibold py-2.5 rounded-md hover:bg-brass-bright disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brass hover:text-brass-bright">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
