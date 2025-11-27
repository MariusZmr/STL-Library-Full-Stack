import React, { useState } from 'react';
import { Card, CardContent, Typography, CardActions, Button, CircularProgress } from '@mui/material';
import { StlFile } from '../types';
import StlViewer from './StlViewer'; // Import the new component
import axios from 'axios'; // Import axios to fetch the file

interface FileCardProps {
  file: StlFile;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch the file from the S3 URL.
      // We expect the response to be a 'blob' (binary large object).
      const response = await axios({
        url: file.s3Url,
        method: 'GET',
        responseType: 'blob',
      });

      // Create the custom filename
      const postName = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); // Sanitize name
      const today = new Date().toISOString().split('T')[0]; // Get date as yyyy-mm-dd
      const filename = `${postName}_${today}.stl`;

      // Create a temporary link element to trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Clean up by revoking the object URL and removing the link
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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StlViewer s3Url={file.s3Url} />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {file.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {file.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? <CircularProgress size={20} /> : 'Download'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default FileCard;
