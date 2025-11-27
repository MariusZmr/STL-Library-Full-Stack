import React, { useState } from 'react';
// Remove Material-UI imports
import { StlFile } from '../types';
import StlViewer from './StlViewer';
import axios from 'axios';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // shadcn/ui Card components
import { Button } from '@/components/ui/button'; // shadcn/ui Button
import { Skeleton } from '@/components/ui/skeleton'; // shadcn/ui Skeleton for loading state on button

interface FileCardProps {
  file: StlFile;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
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

    } catch (error) {
      console.error('Error downloading file:', error);
      // You could show an error message to the user here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <StlViewer s3Url={file.s3Url} />
      
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-semibold mb-1">{file.name}</h3>
        <p className="text-sm text-muted-foreground">{file.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full"
        >
          {isDownloading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : 'Download'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileCard;
