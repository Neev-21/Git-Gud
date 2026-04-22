import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has a class
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single()
          
        let targetPath = '/profile'
        if (!profile?.class) {
          targetPath = '/onboarding'
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${targetPath}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${targetPath}`)
        } else {
          return NextResponse.redirect(`${origin}${targetPath}`)
        }
      }
    } else {
      console.error("Auth callback error:", error.message)
    }
  }

  // return the user to an error page with instructions
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const errorPath = '/auth/auth-code-error'
  
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${errorPath}`)
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${errorPath}`)
  } else {
    return NextResponse.redirect(`${origin}${errorPath}`)
  }
}
