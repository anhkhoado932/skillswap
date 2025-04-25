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
      <div className="min-h-screen flex items-center justify-center py-8 md:py-12">
        <div className="container max-w-6xl">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">Explore Videos</CardTitle>
              <CardDescription className="text-lg">
                Discover videos from all users
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading videos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 md:py-12">
      <div className="container max-w-6xl">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">Explore Videos</CardTitle>
            <CardDescription className="text-lg">
              Discover videos from all users
            </CardDescription>
          </CardHeader>
        </Card>

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
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {video.username ? video.username[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {video.username || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {!loading && videos.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No videos have been uploaded yet
            </p>
          </Card>
        )}
      </div>
    </div>
  )
} 