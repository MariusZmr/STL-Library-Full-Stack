import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { StlFile } from '../types';
import StlViewer from '../components/StlViewer';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ArrowLeft } from 'lucide-react'; 
import axios from 'axios';

const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<StlFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('File ID not provided.');
      setLoading(false);
      return;
    }

    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getFileById(id); 
        setFile(data);
      } catch (err) {
        console.error('Failed to fetch file details:', err);
        toast.error('Failed to load file details.');
        setError('Failed to load file details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  const handleDownload = async () => {
    if (!file) return;
    setIsDownloading(true);
    try {
      const response = await axios({
        url: file.s3Url,
        method: 'GET',
        responseType: 'blob',
      });

      const postName = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const today = new Date().toISOString().split('T')[0];
      const filename = `${postName}_${today}.stl`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      link.parentNode?.removeChild(link);
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>File not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const postedDate = new Date(file.createdAt || '').toLocaleDateString();

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{file.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Posted by {file.user?.firstName} {file.user?.lastName} on {postedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-1 h-96 border rounded-md overflow-hidden">
            <StlViewer s3Url={file.s3Url} />
          </div>
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-xl font-semibold">Description</h3>
            <p className="text-muted-foreground">{file.description}</p>
            <Button onClick={handleDownload} disabled={isDownloading} className="w-full sm:w-auto">
              {isDownloading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileDetailPage;