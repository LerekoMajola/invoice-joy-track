import { useState, useCallback } from 'react';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  action: () => void | Promise<void>;
  variant?: 'destructive' | 'default';
  confirmLabel?: string;
}

export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const openConfirmDialog = useCallback((config: Omit<ConfirmDialogState, 'open'>) => {
    setConfirmDialog({ ...config, open: true });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmDialog?.action) {
      await confirmDialog.action();
    }
    closeConfirmDialog();
  }, [confirmDialog, closeConfirmDialog]);

  return {
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    handleConfirm,
  };
}
