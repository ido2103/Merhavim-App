import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// AWS Configuration
const REGION = "il-central-1"; // e.g., "il-central-1"
const BUCKET_NAME = "merhavim-patients-folder";
const OBJECT_KEY = "id_1607"; // Replace with your object key

// Initialize the S3 client
const s3Client = new S3Client({ region: REGION });

async function generatePresignedUrl() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
    });

    // Generate the pre-signed URL (valid for 1 hour by default)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Pre-signed URL:", url);
    return url;
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
  }
}

// Call the function
generatePresignedUrl();
