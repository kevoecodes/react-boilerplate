import { useState } from 'react';

/**
 * UI state shared by every CRUD page: which modal/drawer is open and for which record.
 */
export function useCrud() {
  const [formState, setFormState] = useState({ open: false, mode: 'create', record: null });
  const [confirmRecord, setConfirmRecord] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);

  return {
    form: formState,
    openCreate: () => setFormState({ open: true, mode: 'create', record: null }),
    openEdit: (record) => setFormState({ open: true, mode: 'edit', record }),
    closeForm: () => setFormState((s) => ({ ...s, open: false })),

    confirmRecord,
    askDelete: setConfirmRecord,
    closeConfirm: () => setConfirmRecord(null),

    detailRecord,
    openDetail: setDetailRecord,
    closeDetail: () => setDetailRecord(null),
  };
}
