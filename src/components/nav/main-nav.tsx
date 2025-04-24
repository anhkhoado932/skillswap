'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { Home, Compass, LogOut } from 'lucide-react'

export function MainNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center gap-4">
          <Link href={user ? '/dashboard' : '/'}>
            <Button
              variant="ghost"
              className={cn(
                'gap-2',
                pathname === '/dashboard' && 'bg-accent'
              )}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="ghost"
              className={cn(
                'gap-2',
                pathname === '/explore' && 'bg-accent'
              )}
            >
              <Compass className="h-4 w-4" />
              <span>Explore</span>
            </Button>
          </Link>
        </div>
        {user && (
          <Button variant="ghost" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        )}
      </div>
    </header>
  )
} 