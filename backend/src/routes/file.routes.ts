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
router.put('/:id', authMiddleware, adminMiddleware, updateFile); // Added adminMiddleware

// @route   POST /api/files/upload
// @desc    Upload a new STL file
// @access  Private (requires auth and admin roles)
// The 'file' field in the form-data is the name of the file input
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), uploadFile); // Added adminMiddleware

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private (requires auth and admin roles)
router.delete('/:id', authMiddleware, adminMiddleware, deleteFile); // Added adminMiddleware

export default router;
