import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StlFile } from '../types';

interface EditFileDialogProps {
  file: StlFile | null; // The file to edit, or null if dialog is closed
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileId: string, name: string, description: string) => Promise<void>;
}

const EditFileDialog: React.FC<EditFileDialogProps> = ({ file, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update form fields when the `file` prop changes (i.e., when dialog opens/new file selected)
  useEffect(() => {
    if (file) {
      setName(file.name);
      setDescription(file.description);
    } else {
      // Clear form when dialog is closed or file is null
      setName('');
      setDescription('');
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return; // Should not happen if dialog is properly controlled
    setIsSaving(true);
    try {
      await onSave(file.id, name, description);
      onClose(); // Close dialog on successful save
    } catch (error) {
      // Error is handled by FileContext toasts
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
          <DialogDescription>
            Make changes to file details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            ) : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFileDialog;
