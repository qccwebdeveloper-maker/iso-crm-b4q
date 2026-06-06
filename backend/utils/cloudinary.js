const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, folder = 'iso-crm/documents', originalname = 'file') => {
  return new Promise((resolve, reject) => {
    const ext = originalname.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    const resourceType = isImage ? 'image' : 'raw';
    const publicId = `${Date.now()}-${originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_')}`;
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: publicId, folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });

module.exports = { uploadToCloudinary, deleteFromCloudinary };
