'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/upload/file-upload'
import { supabase } from '@/lib/supabase'

interface Video {
  id: number
  created_at: string
  video_url: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchVideos() {
      try {
        if (!user) return

        // Fetch videos from the uploads table for the current user
        const { data, error } = await supabase
          .from('uploads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setVideos(data || [])
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoadingVideos(false)
      }
    }

    if (user) {
      fetchVideos()
    }
  }, [user])

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
    <div className="container py-4 md:py-8">
      <div className="grid gap-6">
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
          <CardHeader className="text-center">
            <CardTitle className="text-lg md:text-xl">Your Videos</CardTitle>
            <CardDescription>
              {loadingVideos
                ? 'Loading your videos...'
                : `You have uploaded ${videos.length} videos`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video">
                    <video
                      className="w-full h-full object-cover"
                      src={video.video_url}
                      controls
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loadingVideos && videos.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No videos uploaded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 