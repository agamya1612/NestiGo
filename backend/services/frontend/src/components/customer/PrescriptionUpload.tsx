'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function PrescriptionUpload({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  
  const handleUpload = () => {
    setLoading(true);
    setTimeout(() => {
      onUploadSuccess('https://mock-storage.com/rx.jpg');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4 border rounded-xl bg-surface-1">
      <h3 className="font-bold mb-2">Prescription Required</h3>
      <p className="text-sm text-muted-foreground mb-4">Upload a valid doctor's prescription for these items.</p>
      <Button onClick={handleUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Prescription'}</Button>
    </div>
  );
}
