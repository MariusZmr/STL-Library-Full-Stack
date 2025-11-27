import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiles } from '../contexts/FileContext';
import { toast } from 'react-toastify';
import StlViewer from '../components/StlViewer'; // Import the viewer

const AdminPage: React.FC = () => {
  const { files, loading, addFile, removeFile } = useFiles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // State for the preview URL

  // Effect to clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clean up previous URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const file = event.target.files?.[0];
    // VALIDATION FIX: Check file extension instead of MIME type for reliability
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      setSelectedFile(file);
      // Create a new local URL for the selected file
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (file) { // Only show a warning if a file was actually selected
        toast.warn('Please select a valid .stl file.');
      }
      // Clear the file input if the file is invalid or selection is cancelled
      if(event.target) event.target.value = '';
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !description || !selectedFile) {
      toast.warn('All fields, including the file, are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', selectedFile);

    try {
      await addFile(formData);
      // Reset form and preview on success
      setName('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      // Error is handled by the context's toast
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Upload Form */}
          <Grid item xs={12} md={previewUrl ? 6 : 12}>
            <Typography variant="h6" gutterBottom>
              Upload New STL File
            </Typography>
            <Box component="form" onSubmit={handleUploadSubmit} noValidate>
              <TextField fullWidth margin="normal" label="File Name / Title" value={name} onChange={(e) => setName(e.target.value)} required />
              <TextField fullWidth margin="normal" label="Description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
              <Button variant="contained" component="label" sx={{ mt: 2 }}>
                Choose File
                <input id="file-input" type="file" hidden accept=".stl" onChange={handleFileChange} />
              </Button>
              {selectedFile && <Typography sx={{ display: 'inline', ml: 2, fontStyle: 'italic' }}>{selectedFile.name}</Typography>}
              <Button type="submit" variant="contained" color="primary" sx={{ display: 'block', mt: 2 }}>
                Upload
              </Button>
            </Box>
          </Grid>

          {/* Preview Pane */}
          {previewUrl && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ border: '1px solid lightgray', borderRadius: '4px' }}>
                <StlViewer s3Url={previewUrl} />
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* File Management Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Manage Existing Files
      </Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell component="th" scope="row">{file.name}</TableCell>
                  <TableCell>{file.description}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="edit" onClick={() => toast.info('Editing is not implemented yet.')}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => removeFile(file.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminPage;
