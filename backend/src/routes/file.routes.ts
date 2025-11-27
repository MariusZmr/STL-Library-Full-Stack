import { Router } from 'express';
import { getFiles, uploadFile, deleteFile, getFileById, updateFile } from '../controllers/file.controller'; // Import updateFile
import upload from '../utils/fileUpload';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware'; // Changed to named import for authMiddleware and added adminMiddleware

const router = Router();

// @route   GET /api/files
// @desc    Get all files
// @access  Public
router.get('/', getFiles);

// @route   GET /api/files/:id
// @desc    Get a single file by ID
// @access  Public (for now, can be made private later)
router.get('/:id', getFileById); // New route

// @route   PUT /api/files/:id
// @desc    Update a file's details
// @access  Private
router.put('/:id', authMiddleware, updateFile); // New route

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
