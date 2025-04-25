'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface Video {
  id: number
  created_at: string
  video_url: string
  user_id: string
  username: string | null
}

export default function ExplorePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllVideos() {
      try {
        // First fetch videos
        const { data: uploads, error: uploadsError } = await supabase
          .from('uploads')
          .select('*')
          .order('created_at', { ascending: false })

        if (uploadsError) {
          throw uploadsError
        }

        // Then fetch usernames for each video
        const videosWithUsernames = await Promise.all(
          (uploads || []).map(async (video) => {
            const { data: userData } = await supabase
              .from('auth.users')
              .select('username')
              .eq('id', video.user_id)
              .single()

            return {
              ...video,
              username: userData?.username || null
            }
          })
        )

        setVideos(videosWithUsernames)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllVideos()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Videos</CardTitle>
          <CardDescription>
            Discover videos from all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg space-y-4 md:space-y-0"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-32">
                    <video
                      className="w-full h-48 md:h-24 object-cover rounded"
                      src={video.video_url}
                      controls
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Uploaded by {video.username || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {!loading && videos.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No videos have been uploaded yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 