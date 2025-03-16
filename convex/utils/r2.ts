// Use Node.js runtime for Cloudflare R2 storage
"use node";

// Utility functions for Cloudflare R2 integration

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

// Get R2 configuration from environment variables
export function getR2Config(): R2Config {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || "a-ok-rss",
  };
}

// Generate a pre-signed URL for uploading to R2
export async function generateR2UploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const config = getR2Config();
  
  // This is a simplified implementation
  // In a real application, you would use the Cloudflare API to generate a pre-signed URL
  // For now, we'll return a placeholder URL
  return `https://${config.bucketName}.r2.cloudflarestorage.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${config.accessKeyId}...`;
}

// Generate a public URL for an R2 object
export function getR2PublicUrl(key: string): string {
  const config = getR2Config();
  return `https://${config.bucketName}.r2.cloudflarestorage.com/${key}`;
}

// Helper function to upload a buffer to R2
export async function uploadToR2(buffer: Buffer, key: string, contentType: string): Promise<string> {
  // In a real implementation, you would use the Cloudflare API to upload the buffer
  // For now, we'll just return the public URL
  return getR2PublicUrl(key);
}
