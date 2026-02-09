import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClientDocument {
  id: string;
  clientId: string;
  title: string;
  fileName: string;
  fileSize: number | null;
  fileUrl: string;
  createdAt: string;
}

export function useClientDocuments(clientId: string | undefined) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    if (!user || !clientId) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(
        (data || []).map((d: any) => ({
          id: d.id,
          clientId: d.client_id,
          title: d.title,
          fileName: d.file_name,
          fileSize: d.file_size,
          fileUrl: d.file_url,
          createdAt: d.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching client documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, clientId]);

  const uploadDocument = async (file: File, title?: string) => {
    if (!user || !clientId) {
      toast.error('You must be logged in');
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `client-docs/${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('client_documents')
        .insert({
          user_id: user.id,
          client_id: clientId,
          title: title || file.name,
          file_name: file.name,
          file_size: file.size,
          file_url: urlData.publicUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const newDoc: ClientDocument = {
        id: (data as any).id,
        clientId: (data as any).client_id,
        title: (data as any).title,
        fileName: (data as any).file_name,
        fileSize: (data as any).file_size,
        fileUrl: (data as any).file_url,
        createdAt: (data as any).created_at,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      toast.success('Document uploaded');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (docId: string, fileUrl: string) => {
    try {
      // Extract storage path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/company-assets/');
      if (pathParts[1]) {
        await supabase.storage.from('company-assets').remove([pathParts[1]]);
      }

      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
