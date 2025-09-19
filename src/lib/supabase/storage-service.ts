import { supabase } from './client'

/**
 * Service for handling authenticated file downloads from Supabase storage
 * using the Supabase client's built-in storage methods
 */
export class StorageService {
  /**
   * Download a file from Supabase storage using the Supabase client
   */
  static async downloadFile(bucket: string, filePath: string, filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath)
      
      if (error) {
        throw new Error(`Failed to download file: ${error.message}`)
      }

      // Convert to blob and create download link
      const blob = new Blob([data])
      const url = URL.createObjectURL(blob)
      
      // Create download link and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(url), 100)
      
      return { success: true }
    } catch (error) {
      console.error('Error downloading file:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Get the bucket name from environment variables with fallback
   */
  static getBucketName(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'user-tasks-store'
  }
}