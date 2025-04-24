'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/upload/file-upload'
import { supabase } from '@/lib/supabase'

interface Upload {
  id: number
  created_at: string
  video_url: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loadingUploads, setLoadingUploads] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchUploads() {
      try {
        const { data, error } = await supabase
          .from('uploads')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setUploads(data || [])
      } catch (error) {
        console.error('Error fetching uploads:', error)
      } finally {
        setLoadingUploads(false)
      }
    }

    if (user) {
      fetchUploads()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="container space-y-4 py-4 md:py-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Welcome, {user.email}</CardTitle>
                <CardDescription>Upload and manage your videos</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Your Videos</CardTitle>
                <CardDescription>
                  {loadingUploads
                    ? 'Loading your videos...'
                    : `You have uploaded ${uploads.length} videos`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg space-y-4 md:space-y-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-full md:w-32">
                          <video
                            className="w-full h-48 md:h-24 object-cover rounded"
                            src={upload.video_url}
                            controls
                          />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
                            Uploaded on {new Date(upload.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loadingUploads && uploads.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No videos uploaded yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 