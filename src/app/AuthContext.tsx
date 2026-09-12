import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"

import { Session, User } from "@supabase/supabase-js"

import { Profile, supabase } from "../lib/supabase"

import { getUserProfile } from "../lib/auth"

type AuthContextType = {
  session: Session | null

  user: User | null

  profile: Profile | null

  loading: boolean

  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  const [user, setUser] = useState<User | null>(null)

  const [profile, setProfile] = useState<Profile | null>(null)

  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const p = await getUserProfile(userId).catch(() => null)

    setProfile(p)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)

      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)

      setUser(sess?.user ?? null)

      if (sess?.user) {
        fetchProfile(sess.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)

        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
