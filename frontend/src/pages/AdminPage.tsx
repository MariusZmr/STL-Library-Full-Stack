import React, { useState, useEffect } from 'react';
import { useFiles } from '../contexts/FileContext';
import { toast } from 'react-toastify';
import StlViewer from '../components/StlViewer'; // Import the viewer
import { Button } from '@/components/ui/button'; // shadcn/ui Button
import { Input } from '@/components/ui/input';   // shadcn/ui Input
import { Label } from '@/components/ui/label';   // shadcn/ui Label
import { Textarea } from '@/components/ui/textarea'; // Import the Textarea component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // shadcn/ui Card
import { Skeleton } from '@/components/ui/skeleton'; // shadcn/ui Skeleton
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'; // shadcn/ui Table components
import { Pencil, Trash2 } from 'lucide-react'; // Lucide icons

const AdminPage: React.FC = () => {
  const { files, loading, addFile, removeFile } = useFiles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Effect to clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (file) {
        toast.warn('Please select a valid .stl file.');
      }
      if(event.target) (event.target as HTMLInputElement).value = ''; // Clear file input
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
      setName('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      // Handled by context
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Upload Form */}
        <Card className={previewUrl ? "" : "md:col-span-2"}>
          <CardHeader>
            <CardTitle className="text-xl">Upload New STL File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">File Name / Title</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="file-input">Choose File</Label>
                <Input id="file-input" type="file" accept=".stl" onChange={handleFileChange} className="w-auto" />
                {selectedFile && <span className="text-sm italic text-gray-500">{selectedFile.name}</span>}
              </div>
              <Button type="submit" className="w-full">
                Upload File
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Pane */}
        {previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Preview</CardTitle>
            </CardHeader>
            <CardContent className="h-64"> {/* Fixed height for preview */}
              <StlViewer s3Url={previewUrl} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* File Management Table */}
      <h2 className="text-2xl font-bold mb-4">Manage Existing Files</h2>
      {loading ? (
        <div className="flex justify-center">
          <Skeleton className="h-10 w-full rounded-md" /> {/* Table header skeleton */}
          {Array.from({ length: 5 }).map((_, i) => ( // 5 rows of skeleton
            <Skeleton key={i} className="h-10 w-full rounded-md mt-2" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No files found.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.description}</TableCell>
                    <TableCell className="text-right flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => toast.info('Editing is not implemented yet.')}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => removeFile(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
