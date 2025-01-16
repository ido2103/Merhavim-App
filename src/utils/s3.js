import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Safe debug logging that doesn't expose credentials
console.log('AWS Configuration Status:', {
  hasAccessKey: !!process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  hasSessionToken: !!process.env.REACT_APP_AWS_SESSION_TOKEN,
  NODE_ENV: process.env.NODE_ENV,
});

if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID || !process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials not found in environment variables');
}

const s3Client = new S3Client({
  region: "eu-west-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN,
  }
});

export const generatePresignedUrl = async (patientId) => {
  if (!patientId) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: "merhavim-patients-folder",
      Key: `id_${patientId}/info.json`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    console.log('Debug - Generated presigned URL:', url);
    return url;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    console.error("Error generating presigned URL:", {
      errorName: error.name,
      errorMessage: error.message,
      hasCredentials: {
        hasAccessKey: !!process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        hasSessionToken: !!process.env.REACT_APP_AWS_SESSION_TOKEN,
      }
    });
    throw error;
  }
};

export const checkPatientFolder = async (patientId) => {
  if (!patientId) return false;

  try {
    const command = new ListObjectsV2Command({
      Bucket: "merhavim-patients-folder",
      Prefix: `id_${patientId}/`,
      MaxKeys: 1
    });

    const response = await s3Client.send(command);
    return response.Contents && response.Contents.length > 0;
  } catch (error) {
    console.error("Error checking patient folder:", {
      errorName: error.name,
      errorMessage: error.message,
      hasCredentials: {
        hasAccessKey: !!process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        hasSessionToken: !!process.env.REACT_APP_AWS_SESSION_TOKEN,
      }
    });
    throw error;
  }
}; 