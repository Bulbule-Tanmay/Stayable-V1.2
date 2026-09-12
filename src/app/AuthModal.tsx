import { useState, useEffect } from "react"

import StayableLogo from "../components/StayableLogo"

import {
  signInStudent,
  signInWithEmail,
  signUpOwner,
  signUpStudent,
} from "../lib/auth"

import { useAuth } from "./AuthContext"

type Mode = "student" | "student-sent" | "owner-login" | "owner-signup"

type Props = {
  onClose: () => void

  defaultMode?: "student" | "owner"
}

export default function AuthModal({ onClose, defaultMode = "student" }: Props) {
  const { user } = useAuth()

  const [mode, setMode] = useState<Mode>(
    defaultMode === "owner" ? "owner-login" : "student",
  )

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [fullName, setFullName] = useState("")

  const [phone, setPhone] = useState("")

  const [isNewStudent, setIsNewStudent] = useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")

  useEffect(() => {
    if (user) onClose()
  }, [user, onClose])

  const handleStudentSubmit = async () => {
    if (!email || !password) return

    setLoading(true)

    setError("")

    try {
      if (isNewStudent) {
        await signUpStudent(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (e: any) {
      const msg: string = e.message ?? ""

      if (
        !isNewStudent &&
        (msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("credentials"))
      ) {
        setError(
          'Wrong email or password. New here? Switch to "Create account" below.',
        )
      } else if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("user already exists")
      ) {
        setError("This email already has an account. Try logging in instead.")
      } else {
        setError(msg || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) return

    setLoading(true)

    setError("")

    try {
      await signInStudent(email)

      setMode("student-sent")
    } catch (e: any) {
      setError(e.message ?? "Failed to send link. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleOwnerLogin = async () => {
    if (!email || !password) return

    setLoading(true)

    setError("")

    try {
      await signInWithEmail(email, password)

      onClose()
    } catch (e: any) {
      setError(e.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleOwnerSignup = async () => {
    if (!email || !password || !fullName) return

    setLoading(true)

    setError("")

    try {
      await signUpOwner(email, password, fullName, phone)

      setMode("owner-login")

      setError("")
    } catch (e: any) {
      setError(e.message ?? "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <StayableLogo className="h-7 w-auto" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-muted">
              close
            </span>
          </button>
        </div>

        {/* Tab switcher */}
        {mode !== "student-sent" && (
          <div className="flex bg-surface-high p-1 rounded-full mb-5 gap-1">
            <button
              onClick={() => {
                setMode("student")
                setError("")
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                mode === "student"
                  ? "bg-primary-dark text-white"
                  : "text-on-surface-muted"
              }`}
            >
              I am a Student
            </button>
            <button
              onClick={() => {
                setMode("owner-login")
                setError("")
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                mode.startsWith("owner")
                  ? "bg-primary-dark text-white"
                  : "text-on-surface-muted"
              }`}
            >
              I am an Owner
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Student: email + password */}
        {mode === "student" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-extrabold text-on-surface">
                {isNewStudent ? "Create Student Account" : "Student Sign In"}
              </h2>
              <p className="text-xs text-on-surface-muted mt-0.5">
                No brokerage. Direct from owners.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStudentSubmit()}
                  placeholder="Password"
                  className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button
              onClick={handleStudentSubmit}
              disabled={!email || !password || loading}
              className="w-full h-12 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isNewStudent ? (
                "Create Account →"
              ) : (
                "Sign In →"
              )}
            </button>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setIsNewStudent((v) => !v)
                  setError("")
                }}
                className="text-xs text-secondary font-semibold"
              >
                {isNewStudent
                  ? "Already have an account? Sign in"
                  : "New here? Create account"}
              </button>
              <button
                onClick={handleMagicLink}
                disabled={!email || loading}
                className="text-xs text-on-surface-muted disabled:opacity-40"
              >
                Use magic link
              </button>
            </div>
          </div>
        )}

        {/* Student: magic link sent */}
        {mode === "student-sent" && (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[36px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_read
              </span>
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl font-extrabold text-on-surface mb-1">
                Check Your Inbox
              </h2>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                We sent a sign-in link to{" "}
                <span className="font-semibold text-on-surface">{email}</span>.
                <br />
                Click it in the email — this tab updates automatically.
              </p>
            </div>
            <div className="w-full bg-surface-low rounded-xl p-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-muted shrink-0 mt-0.5">
                info
              </span>
              <p className="text-xs text-on-surface-muted">
                {"Can't find it? Check spam or "}
                <button
                  onClick={() => {
                    setMode("student")
                    setError("")
                  }}
                  className="text-secondary font-semibold underline"
                >
                  go back
                </button>
                {" to use a password instead."}
              </p>
            </div>
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full h-11 rounded-xl border border-surface-high text-secondary text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Sending..." : "Resend sign-in link"}
            </button>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-surface-high text-on-surface text-sm font-semibold"
            >
              Close — I will click the link
            </button>
          </div>
        )}

        {/* Owner Login */}
        {mode === "owner-login" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-extrabold text-on-surface">
                Owner Login
              </h2>
              <p className="text-xs text-on-surface-muted mt-0.5">
                List your PG or Flat. Zero brokerage.
              </p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOwnerLogin()}
              placeholder="Password"
              className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleOwnerLogin}
              disabled={!email || !password || loading}
              className="w-full h-12 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Login →"
              )}
            </button>
            <button
              onClick={() => {
                setMode("owner-signup")
                setError("")
              }}
              className="text-xs text-center text-secondary font-semibold"
            >
              New owner? Create account →
            </button>
          </div>
        )}

        {/* Owner Signup */}
        {mode === "owner-signup" && (
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold text-on-surface">
                Create Owner Account
              </h2>
              <p className="text-xs text-on-surface-muted mt-0.5">
                Start listing in under 2 minutes
              </p>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="WhatsApp number (for student leads)"
              className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              className="w-full h-12 px-4 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleOwnerSignup}
              disabled={!email || !password || !fullName || loading}
              className="w-full h-12 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account →"
              )}
            </button>
            <button
              onClick={() => {
                setMode("owner-login")
                setError("")
              }}
              className="text-xs text-center text-on-surface-muted"
            >
              Already have an account? Login
            </button>
            <p className="text-[11px] text-center text-on-surface-muted leading-relaxed">
              After signing up, check your email and click the verification
              link, then log in here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
