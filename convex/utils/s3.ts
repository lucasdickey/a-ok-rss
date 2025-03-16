// Use Node.js runtime for AWS S3 storage
"use node";

import AWS from 'aws-sdk';

export function getS3Client() {
  // Initialize the S3 client with credentials
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });

  return s3;
}

export async function uploadToS3(
  buffer: Buffer, 
  key: string, 
  contentType: string
): Promise<string> {
  const s3 = getS3Client();
  const bucketName = process.env.S3_BUCKET_NAME || 'a-ok-rss';
  
  await s3.upload({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }).promise();
  
  // Return the S3 URL
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}

export async function getFromS3(key: string): Promise<Buffer> {
  const s3 = getS3Client();
  const bucketName = process.env.S3_BUCKET_NAME || 'a-ok-rss';
  
  const response = await s3.getObject({
    Bucket: bucketName,
    Key: key,
  }).promise();
  
  return response.Body as Buffer;
}

export async function deleteFromS3(key: string): Promise<void> {
  const s3 = getS3Client();
  const bucketName = process.env.S3_BUCKET_NAME || 'a-ok-rss';
  
  await s3.deleteObject({
    Bucket: bucketName,
    Key: key,
  }).promise();
}

export function getS3Url(key: string): string {
  const bucketName = process.env.S3_BUCKET_NAME || 'a-ok-rss';
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}
