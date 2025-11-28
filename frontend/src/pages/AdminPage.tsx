import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useFiles } from '../contexts/FileContext';
import { toast } from 'react-toastify';
import StlViewer, { StlViewerRef } from '../components/StlViewer'; // Import StlViewerRef
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Pencil, Trash2, Camera } from 'lucide-react'; // Import Camera icon
import { StlFile } from '../types';
import EditFileDialog from '../components/EditFileDialog';

const AdminPage: React.FC = () => {
  const { files, loading, addFile, removeFile, updateFile } = useFiles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<StlFile | null>(null);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null); // State for captured snapshot

  const stlViewerRef = useRef<StlViewerRef>(null); // Ref for StlViewer

  // Effect to clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (snapshotDataUrl && snapshotDataUrl.startsWith('blob:')) { // Clean up snapshot if it's a blob URL
        URL.revokeObjectURL(snapshotDataUrl);
      }
    };
  }, [previewUrl, snapshotDataUrl]); // Add snapshotDataUrl to dependency array

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (snapshotDataUrl) { // Clear snapshot when new file selected
      URL.revokeObjectURL(snapshotDataUrl);
      setSnapshotDataUrl(null);
    }
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.stl')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      if (file) {
        toast.warn('Please select a valid .stl file.');
      }
      if(event.target) (event.target as HTMLInputElement).value = '';
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (stlViewerRef.current) {
      if (snapshotDataUrl && snapshotDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(snapshotDataUrl);
      }
      const dataUrl = stlViewerRef.current.takeSnapshot();
      if (dataUrl) {
        setSnapshotDataUrl(dataUrl);
        toast.success('Snapshot captured!');
      } else {
        toast.error('Failed to capture snapshot.');
      }
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !description || !selectedFile) {
      toast.warn('All fields, including the file, are required.');
      return;
    }
    if (!snapshotDataUrl) {
        toast.warn('Please take a snapshot for the thumbnail.');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', selectedFile);
    formData.append('thumbnail', snapshotDataUrl); // Append snapshot data

    try {
      await addFile(formData);
      setName('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setSnapshotDataUrl(null); // Clear snapshot on successful upload
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      // Handled by context
    }
  };

  const handleEditClick = (file: StlFile) => {
    setFileToEdit(file);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedFile = async (fileId: string, newName: string, newDescription: string) => {
    await updateFile(fileId, newName, newDescription);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>

      {/* User Management Link */}
      <div className="mb-6 flex justify-end">
        <Link to="/admin/users">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" /> Manage Users
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Upload Form */}
        <Card className={previewUrl || snapshotDataUrl ? "" : "md:col-span-2"}>
          <CardHeader>
            <CardTitle className="text-xl">Upload New STL File</CardTitle>
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

        {/* Preview and Snapshot Pane */}
        {(previewUrl || snapshotDataUrl) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Preview & Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshotDataUrl ? (
                // Display captured snapshot
                <div className="relative h-64 w-full border rounded-md overflow-hidden">
                    <img src={snapshotDataUrl} alt="Captured Snapshot" className="h-full w-full object-contain" />
                    <Button 
                        variant="ghost" size="icon" 
                        onClick={() => setSnapshotDataUrl(null)} 
                        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                // Display interactive 3D preview
                previewUrl && (
                    <div className="h-64 border rounded-md overflow-hidden">
                        <StlViewer s3Url={previewUrl} ref={stlViewerRef} autoRotate={false} />
                    </div>
                )
              )}
              {previewUrl && !snapshotDataUrl && ( // Show take snapshot button only if preview is active and no snapshot taken
                <Button onClick={handleTakeSnapshot} className="w-full mt-4">
                  <Camera className="mr-2 h-4 w-4" /> Take Snapshot
                </Button>
              )}
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
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(file)}>
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

      <EditFileDialog
        file={fileToEdit}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEditedFile}
      />
    </div>
  );
};

export default AdminPage;