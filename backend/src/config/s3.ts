import { S3Client } from '@aws-sdk/client-s3';
// No need for dotenv here if variables are passed by PM2.

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

console.log('S3 Config Debug:');
console.log('Region:', region);
console.log('Access Key ID:', accessKeyId);
console.log('Secret Access Key:', secretAccessKey ? 'SET' : 'NOT_SET');
console.log('Bucket Name (from env, not used here directly):', process.env.AWS_BUCKET_NAME); // For more complete debug

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error('AWS configuration is incomplete. Please check your .env file or PM2 config.');
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default s3Client;
