import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { StlFile } from '../types';
import { toast } from 'react-toastify';

interface FileContextType {
  files: StlFile[];
  loading: boolean;
  fetchFiles: (searchTerm?: string) => Promise<void>;
  addFile: (formData: FormData) => Promise<void>;
  removeFile: (fileId: string) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<StlFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFiles = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      const data = await api.getFiles(searchTerm);
      setFiles(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch files.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const addFile = async (formData: FormData) => {
    try {
      await api.uploadFile(formData);
      toast.success('File uploaded successfully!');
      await fetchFiles(); // Refetch files to see the new upload
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file. Please try again.');
      throw err; // Re-throw error to be caught by the component
    }
  };

  const removeFile = async (fileId: string) => {
    // Keep the original files in case the delete fails
    const originalFiles = [...files];
    // Optimistic UI update
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));

    try {
      await api.deleteFile(fileId);
      toast.success('File deleted successfully!');
    } catch (err) {
      console.error(err);
      // Rollback on error
      setFiles(originalFiles);
      toast.error('Failed to delete file.');
    }
  };

  // The 'error' state is removed from the context value as we now handle errors via toasts.
  return (
    <FileContext.Provider value={{ files, loading, fetchFiles, addFile, removeFile }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
