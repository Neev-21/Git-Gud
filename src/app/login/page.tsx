'use client'

import { createClient } from '@/utils/supabase/client'
import { Sword } from 'lucide-react'

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error("Login error:", error.message)
        alert("Failed to login: " + error.message)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("An unexpected error occurred during login.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/40 via-slate-900 to-slate-900" />
      
      <main className="z-10 flex flex-col items-center max-w-lg w-full p-8 border-2 border-slate-800 bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl space-y-8 text-center transition-transform duration-300">
        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 transform rotate-12 transition-transform duration-300 hover:rotate-0">
          <Sword className="w-12 h-12 text-blue-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-mono uppercase">
            Git <span className="text-blue-500">Gud</span>
          </h1>
          <p className="text-lg text-slate-400">
            Level up your developer resume. Turn your commits into XP, join guilds, and conquer hackathons.
          </p>
        </div>

        <div className="w-full pt-4">
          <button
            onClick={handleLogin}
            className="group relative w-full flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:bg-blue-50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span>Sign in with GitHub</span>
          </button>
        </div>
      </main>
    </div>
  )
}
