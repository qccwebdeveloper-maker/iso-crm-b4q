const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Credentials are read automatically from the environment
// (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) in local/dev, or from the
// instance IAM role when running on EC2 — so no keys need to live in code.
const s3 = new S3Client({ region: process.env.AWS_REGION });

const BUCKET = process.env.S3_BUCKET;

// Upload a buffer to S3 (private object) and return a Cloudinary-compatible shape:
//   secure_url → a relative API link the browser hits to get a fresh signed URL
//   public_id  → the S3 object key (used later for delete)
const uploadToS3 = async (buffer, folder = 'iso-crm/documents', originalname = 'file', mimetype = 'application/octet-stream') => {
  const safeName = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
  const key = `${folder}/${safeName}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  return { secure_url: `/api/files/${key}`, public_id: key };
};

// Generate a short-lived presigned GET URL for a private object.
const getSignedFileUrl = (key, expiresIn = 300) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });

const deleteFromS3 = (key) =>
  s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

module.exports = { uploadToS3, getSignedFileUrl, deleteFromS3 };
