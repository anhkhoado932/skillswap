'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface Video {
  name: string
  created_at: string
  url: string
  user_id: string
}

export default function ExplorePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllVideos() {
      try {
        // List all folders (user IDs)
        const { data: folders, error: foldersError } = await supabase.storage
          .from('video')
          .list()

        if (foldersError) {
          throw foldersError
        }

        // For each folder (user), get their videos
        const allVideos = await Promise.all(
          folders.map(async (folder) => {
            // Get user's videos
            const { data: files, error: filesError } = await supabase.storage
              .from('video')
              .list(folder.name)

            if (filesError) {
              console.error('Error fetching videos for user:', folder.name, filesError)
              return []
            }

            // Get URLs for all videos
            return Promise.all(
              (files || []).map(async (file) => {
                const { data: { publicUrl } } = supabase.storage
                  .from('video')
                  .getPublicUrl(`${folder.name}/${file.name}`)

                return {
                  name: file.name,
                  created_at: file.created_at,
                  url: publicUrl,
                  user_id: folder.name
                }
              })
            )
          })
        )

        // Flatten array and sort by date
        const flattenedVideos = allVideos
          .flat()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setVideos(flattenedVideos)
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
                key={`${video.user_id}-${video.name}`}
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
                  <div className="space-y-1">
                    <p className="font-medium">
                      Uploaded by user {video.user_id}
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