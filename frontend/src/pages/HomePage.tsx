import React, { useState, useEffect } from 'react';
import { Grid, TextField, Box, Typography, Skeleton, Card, CardContent } from '@mui/material';
import FileCard from '../components/FileCard';
import { useFiles } from '../contexts/FileContext';
import { useDebounce } from '../hooks/useDebounce';

// This component renders the skeleton placeholders
const FileCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={140} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
    </CardContent>
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rounded" width={80} height={30} />
    </Box>
  </Card>
);

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { files, loading, fetchFiles } = useFiles();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchFiles(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchFiles]);

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        STL File Library
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search for files..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Grid container spacing={4}>
        {loading ? (
          // Render 6 skeleton cards while loading
          Array.from(new Array(6)).map((_, index) => (
            <Grid key={index} xs={12} sm={6} md={4}>
              <FileCardSkeleton />
            </Grid>
          ))
        ) : (
          // Render the actual file cards when loading is complete
          files.map(file => (
            <Grid key={file.id} xs={12} sm={6} md={4}>
              <FileCard file={file} />
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

export default HomePage;
