import { Request, Response } from 'express';
import { StlFile, User } from '../models';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3';

// Extend the Multer S3 file type to include location and key
interface S3File extends Express.Multer.File {
    key: string;
    location: string;
}

import { Op } from 'sequelize'; // Import Op for search queries

// ... (interface S3File is already defined in the original file)

export const getFiles = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9; // Default to 9 for a 3x3 grid
        const searchTerm = req.query.search as string || '';

        const offset = (page - 1) * limit;

        const whereCondition = searchTerm 
            ? { name: { [Op.like]: `%${searchTerm}%` } }
            : {};

        const { count, rows } = await StlFile.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']],
            distinct: true, // Important for correct count with includes
        });
        
        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalFiles: count,
            files: rows,
        });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Error fetching files.', error: error.message });
        }
        res.status(500).json({ message: 'An unknown error occurred.' });
    }
};

import { Request, Response } from 'express';
import { StlFile, User } from '../models';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'; // Import PutObjectCommand
import s3Client from '../config/s3';
import { Op } from 'sequelize';

// Extend the Multer S3 file type to include location and key
interface S3File extends Express.Multer.File {
    key: string;
    location: string;
}

// ... (getFiles, getFileById, updateFile, deleteFile functions remain the same)

// Utility to upload base64 image to S3
const uploadBase64ImageToS3 = async (base64Data: string, keyPrefix: string, userId: string): Promise<string> => {
    // Remove "data:image/png;base64," prefix
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) {
        throw new Error('Invalid base64 image data.');
    }
    const buffer = Buffer.from(base64Image, 'base64');
    const key = `${keyPrefix}/${userId}-${Date.now()}.png`;

    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'public-read' // Thumbnail should be public
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};


export const uploadFile = async (req: Request, res: Response) => {
    const { name, description, thumbnail } = req.body; // Get thumbnail data
    const file = req.file as S3File;
    const userId = req.user?.id;

    if (!file) {
        return res.status(400).json({ message: 'STL File not provided.' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required.' });
    }
    if (!thumbnail) { // Thumbnail is now required
        return res.status(400).json({ message: 'Thumbnail image is required.' });
    }

    try {
        // Upload thumbnail image to S3
        const thumbnailS3Url = await uploadBase64ImageToS3(thumbnail, 'thumbnails', userId);

        const newStlFile = await StlFile.create({
            name,
            description,
            s3Key: file.key,
            s3Url: file.location,
            thumbnailS3Url, // Save thumbnail URL
            userId,
        });

        res.status(201).json(newStlFile);
    } catch (error) {
        // If thumbnail upload fails, should we delete the STL file from S3?
        // For now, let's just log and return 500.
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Error saving file or thumbnail metadata.', error: error.message });
        }
        res.status(500).json({ message: 'An unknown error occurred.' });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
        const file = await StlFile.findByPk(id);

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        // Optional: Add role-based access control later. For now, only the user who uploaded it can delete it.
        if (file.userId !== userId) {
            return res.status(403).json({ message: 'User not authorized to delete this file.' });
        }

        // Delete from S3
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: file.s3Key,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));

        // Delete from database
        await file.destroy();

        res.status(200).json({ message: 'File deleted successfully.' });

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Error deleting file.', error: error.message });
        }
        res.status(500).json({ message: 'An unknown error occurred.' });
    }
};

export const getFileById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const file = await StlFile.findByPk(id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        res.status(200).json(file);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Error fetching file.', error: error.message });
        }
        res.status(500).json({ message: 'An unknown error occurred.' });
    }
};

export const updateFile = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    // Basic validation
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required.' });
    }

    try {
        const file = await StlFile.findByPk(id);

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        // Authorization check: Only the owner can update the file
        if (file.userId !== userId) {
            return res.status(403).json({ message: 'User not authorized to update this file.' });
        }

        // Update the file details
        file.name = name;
        file.description = description;
        await file.save(); // Save changes to the database

        res.status(200).json(file); // Return the updated file

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Error updating file.', error: error.message });
        }
        res.status(500).json({ message: 'An unknown error occurred.' });
    }
};


