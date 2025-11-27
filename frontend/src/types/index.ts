export interface StlFile {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  fileName: string;
  thumbnailS3Url?: string; // New field for thumbnail URL
}
