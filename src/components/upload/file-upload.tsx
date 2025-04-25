'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload } from 'lucide-react'

export function FileUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)
      setError(null)

      // Upload file to Supabase Storage with a unique name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL for the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('video')
        .getPublicUrl(fileName)

      // Store video metadata in the uploads table
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          video_url: publicUrl,
        })

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from('video').remove([fileName])
        throw dbError
      }

      // Reset file input
      event.target.value = ''
      
      // Reload the page to show new upload
      window.location.reload()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Button
          className="w-full sm:w-auto"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById('video-upload')?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Video</span>
            </>
          )}
        </Button>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 