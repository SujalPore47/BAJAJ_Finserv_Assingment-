"use client";
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type Notification = { message: string; type: 'success' | 'error' };

interface UploadContextType {
  uploadStatus: UploadStatus;
  notification: Notification | null;
  uploadFile: (file: File, pagesToProcess: string) => Promise<void>;
  clearNotification: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (uploadStatus === 'success' || uploadStatus === 'error') {
      const timer = setTimeout(() => setUploadStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const uploadFile = async (file: File, pagesToProcess: string) => {
    setUploadStatus('uploading');
    setNotification(null);

    const formData = new FormData();
    formData.append("file", file);

    let url = "/api/upload";
    if (pagesToProcess) {
      url += `?pages_to_process=${pagesToProcess}`;
    }

    try {
      const response = await fetch(url, { method: "POST", body: formData });
      if (!response.ok) throw new Error('Upload failed');
      
      setUploadStatus('success');
      setNotification({ message: 'File uploaded successfully!', type: 'success' });
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus('error');
      setNotification({ message: 'Upload failed. Please try again.', type: 'error' });
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <UploadContext.Provider value={{ uploadStatus, notification, uploadFile, clearNotification }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};
