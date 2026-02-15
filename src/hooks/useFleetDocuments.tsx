import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FleetDocument {
  id: string;
  vehicleId: string;
  documentType: string;
  fileUrl: string;
  fileName: string | null;
  expiryDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FleetDocumentInsert {
  vehicleId: string;
  documentType: string;
  file: File;
  expiryDate?: string;
  notes?: string;
}

function mapRow(row: any): FleetDocument {
  return {
    id: row.id, vehicleId: row.vehicle_id, documentType: row.document_type,
    fileUrl: row.file_url, fileName: row.file_name, expiryDate: row.expiry_date,
    notes: row.notes, createdAt: row.created_at,
  };
}

export function useFleetDocuments(vehicleId?: string) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<FleetDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user) { setDocuments([]); setIsLoading(false); return; }
    try {
      let query = supabase.from('fleet_documents').select('*').order('created_at', { ascending: false });
      if (vehicleId) query = query.eq('vehicle_id', vehicleId);
      const { data, error } = await query;
      if (error) throw error;
      setDocuments((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching fleet documents:', e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDocuments(); }, [user, vehicleId]);

  const uploadDocument = async (doc: FleetDocumentInsert): Promise<boolean> => {
    if (!user) return false;
    try {
      const filePath = `${user.id}/${doc.vehicleId}/${Date.now()}_${doc.file.name}`;
      const { error: uploadError } = await supabase.storage.from('fleet-documents').upload(filePath, doc.file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('fleet-documents').getPublicUrl(filePath);

      const { error } = await supabase.from('fleet_documents').insert({
        user_id: user.id, vehicle_id: doc.vehicleId,
        document_type: doc.documentType, file_url: urlData.publicUrl,
        file_name: doc.file.name, expiry_date: doc.expiryDate || null,
        notes: doc.notes || null,
      });
      if (error) throw error;
      await fetchDocuments();
      toast.success('Document uploaded');
      return true;
    } catch (e) {
      console.error('Error uploading document:', e);
      toast.error('Failed to upload document');
      return false;
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('fleet_documents').delete().eq('id', id);
      if (error) throw error;
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
      return true;
    } catch (e) {
      toast.error('Failed to delete document');
      return false;
    }
  };

  const expiringDocuments = documents.filter(d => {
    if (!d.expiryDate) return false;
    const daysUntil = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / 86400000);
    return daysUntil <= 30;
  });

  return { documents, expiringDocuments, isLoading, uploadDocument, deleteDocument, refetch: fetchDocuments };
}
