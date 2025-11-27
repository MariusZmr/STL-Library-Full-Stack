import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFiles } from '../contexts/FileContext';
import { toast } from 'react-toastify';

const AdminPage: React.FC = () => {
  const { files, loading, addFile, removeFile } = useFiles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
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
      // Reset form on success
      setName('');
      setDescription('');
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
    } catch (err) {
      // Error is handled by the context's toast, so we just catch it
      // to prevent the form from being reset on failure.
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>

      {/* Upload Form */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload New STL File
        </Typography>
        <Box component="form" onSubmit={handleUploadSubmit} noValidate>
          <TextField
            fullWidth
            margin="normal"
            label="File Name / Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Choose File
            <input
              id="file-input"
              type="file"
              hidden
              accept=".stl"
              onChange={handleFileChange}
            />
          </Button>
          {selectedFile && <Typography sx={{ display: 'inline', ml: 2 }}>{selectedFile.name}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ display: 'block', mt: 2 }}
          >
            Upload
          </Button>
        </Box>
      </Paper>

      {/* File Management Table */}
      <Typography variant="h6" gutterBottom>
        Manage Existing Files
      </Typography>
      {loading && <CircularProgress />}
      {!loading && (
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
                  <TableCell component="th" scope="row">
                    {file.name}
                  </TableCell>
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
