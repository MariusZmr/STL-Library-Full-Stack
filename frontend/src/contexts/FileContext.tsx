import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import * as api from '../services/api'; // Import all of api to use updateFile
import { StlFile } from '../types';
import { toast } from 'react-toastify';

interface FileContextType {
  files: StlFile[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalFiles: number;
  fetchFiles: (page?: number, searchTerm?: string) => Promise<void>;
  addFile: (formData: FormData) => Promise<void>;
  updateFile: (fileId: string, name: string, description: string) => Promise<void>; // New function
  removeFile: (fileId: string) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<StlFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const fetchFiles = useCallback(async (page: number = 1, searchTerm?: string) => {
    try {
      setLoading(true);
      const data = await api.getFiles(page, searchTerm);
      setFiles(data.files); // Set only the files array
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalFiles(data.totalFiles);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch files.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFile = async (formData: FormData) => {
    try {
      await api.uploadFile(formData);
      toast.success('File uploaded successfully!');
      await fetchFiles(currentPage); // Refetch current page to see the new upload
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file. Please try again.');
      throw err;
    }
  };

  const updateFile = async (fileId: string, name: string, description: string) => {
    try {
      const updatedFile = await api.updateFile(fileId, { name, description });
      toast.success('File updated successfully!');
      // Update the file in the local state
      setFiles(prevFiles => 
        prevFiles.map(file => (file.id === fileId ? { ...file, name, description } : file))
      );
      return updatedFile;
    } catch (err) {
      console.error('Error updating file:', err);
      toast.error('Failed to update file. Please try again.');
      throw err;
    }
  };

  const removeFile = async (fileId: string) => {
    const originalFiles = [...files];
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    try {
      await api.deleteFile(fileId);
      toast.success('File deleted successfully!');
      await fetchFiles(currentPage); 
    } catch (err) {
      console.error(err);
      setFiles(originalFiles);
      toast.error('Failed to delete file.');
    }
  };

  return (
    <FileContext.Provider value={{ files, loading, currentPage, totalPages, totalFiles, fetchFiles, addFile, updateFile, removeFile }}>
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
