'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/upload/file-upload'
import { supabase } from '@/lib/supabase'

interface Video {
  name: string
  created_at: string
  url: string
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

        // List all files in the user's folder
        const { data, error } = await supabase.storage
          .from('video')
          .list(user.id)

        if (error) {
          throw error
        }

        // Get URLs for all videos
        const videosWithUrls = await Promise.all(
          (data || []).map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('video')
              .getPublicUrl(`${user.id}/${file.name}`)

            return {
              name: file.name,
              created_at: file.created_at,
              url: publicUrl,
            }
          })
        )

        setVideos(videosWithUrls.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
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
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Your Videos</CardTitle>
            <CardDescription>
              {loadingVideos
                ? 'Loading your videos...'
                : `You have uploaded ${videos.length} videos`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {videos.map((video) => (
                <div
                  key={video.name}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg space-y-4 md:space-y-0"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full md:w-32">
                      <video
                        className="w-full h-48 md:h-24 object-cover rounded"
                        src={video.url}
                        controls
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mt-2 md:mt-0">
                        Uploaded on {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
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