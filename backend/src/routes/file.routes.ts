import { Router } from 'express';
import { getFiles, uploadFile, deleteFile, getFileById } from '../controllers/file.controller'; // Import getFileById
import upload from '../utils/fileUpload';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// @route   GET /api/files
// @desc    Get all files
// @access  Public
router.get('/', getFiles);

// @route   GET /api/files/:id
// @desc    Get a single file by ID
// @access  Public (for now, can be made private later)
router.get('/:id', getFileById); // New route

// @route   POST /api/files/upload
// @desc    Upload a new STL file
// @access  Private
// The 'file' field in the form-data is the name of the file input
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', authMiddleware, deleteFile);

export default router;
