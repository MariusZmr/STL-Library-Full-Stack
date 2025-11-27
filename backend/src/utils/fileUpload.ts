import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from '../config/s3';
import { Request } from 'express';
import path from 'path';

const bucketName = process.env.AWS_BUCKET_NAME;

if (!bucketName) {
  throw new Error('AWS_BUCKET_NAME is not defined in the .env file.');
}

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    acl: 'public-read', // Make files publicly readable
    metadata: function (req: Request, file: Express.Multer.File, cb: (error: any, metadata: any) => void) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: Request, file: Express.Multer.File, cb: (error: any, key: string) => void) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, 'stl-files/' + file.fieldname + '-' + uniqueSuffix + extension);
    }
  }),
  fileFilter: function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    // Accept .stl files only
    if (!file.originalname.match(/\.(stl)$/i)) {
        return cb(new Error('Only .stl files are allowed!'));
    }
    cb(null, true);
  },
});

export default upload;
