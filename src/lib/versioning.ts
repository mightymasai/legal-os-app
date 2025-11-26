import { supabase } from './supabase'
import type { DocumentVersion } from './supabase'

export class VersionManager {
  /**
   * Create a new version when document content changes
   */
  static async createVersion(
    documentId: string,
    content: string,
    userId: string,
    changeSummary?: string
  ): Promise<DocumentVersion | null> {
    try {
      // Get the current version number
      const { data: versions } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)

      const nextVersionNumber = versions && versions.length > 0 ? versions[0].version_number + 1 : 1

      // Only create version if content actually changed
      if (nextVersionNumber > 1) {
        const { data: lastVersion } = await supabase
          .from('document_versions')
          .select('content')
          .eq('document_id', documentId)
          .eq('version_number', nextVersionNumber - 1)
          .single()

        if (lastVersion && lastVersion.content === content) {
          return null // No change, don't create version
        }
      }

      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersionNumber,
          content,
          created_by: userId,
          change_summary,
          file_size: new Blob([content]).size
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating version:', error)
        return null
      }

      // Update document's current version
      await supabase
        .from('documents')
        .update({ current_version: nextVersionNumber, updated_at: new Date().toISOString() })
        .eq('id', documentId)

      return data
    } catch (error) {
      console.error('Version creation error:', error)
      return null
    }
  }

  /**
   * Get all versions for a document
   */
  static async getVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          *,
          created_by_profile:profiles!document_versions_created_by_fkey(full_name, email)
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })

      if (error) {
        console.error('Error fetching versions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Version fetch error:', error)
      return []
    }
  }

  /**
   * Restore a document to a specific version
   */
  static async restoreVersion(
    documentId: string,
    versionNumber: number,
    userId: string
  ): Promise<boolean> {
    try {
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('content')
        .eq('document_id', documentId)
        .eq('version_number', versionNumber)
        .single()

      if (versionError || !version) {
        console.error('Version not found:', versionError)
        return false
      }

      // Update document content
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: version.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (updateError) {
        console.error('Error restoring version:', updateError)
        return false
      }

      // Create a new version with the restored content
      await this.createVersion(
        documentId,
        version.content,
        userId,
        `Restored to version ${versionNumber}`
      )

      return true
    } catch (error) {
      console.error('Version restore error:', error)
      return false
    }
  }

  /**
   * Compare two versions and return differences
   */
  static compareVersions(version1: DocumentVersion, version2: DocumentVersion) {
    // Simple text diff - in production, you'd want a more sophisticated diff algorithm
    const content1 = version1.content || ''
    const content2 = version2.content || ''

    const lines1 = content1.split('\n')
    const lines2 = content2.split('\n')

    const changes = {
      additions: 0,
      deletions: 0,
      modifications: 0
    }

    // Very basic diff - count line differences
    const maxLines = Math.max(lines1.length, lines2.length)
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''

      if (!line1 && line2) changes.additions++
      else if (line1 && !line2) changes.deletions++
      else if (line1 !== line2) changes.modifications++
    }

    return changes
  }

  /**
   * Get version statistics for a document
   */
  static async getVersionStats(documentId: string) {
    try {
      const versions = await this.getVersions(documentId)

      if (versions.length === 0) return null

      const stats = {
        totalVersions: versions.length,
        oldestVersion: versions[versions.length - 1],
        newestVersion: versions[0],
        totalChanges: versions.reduce((sum, version, index) => {
          if (index === 0) return sum
          const changes = this.compareVersions(versions[index - 1], version)
          return sum + changes.additions + changes.deletions + changes.modifications
        }, 0),
        contributors: [...new Set(versions.map(v => v.created_by).filter(Boolean))].length
      }

      return stats
    } catch (error) {
      console.error('Error getting version stats:', error)
      return null
    }
  }
}
