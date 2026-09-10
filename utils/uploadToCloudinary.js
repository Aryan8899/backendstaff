const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Uploads a file buffer (from multer memory storage) to Cloudinary
// and returns the result object (contains secure_url, public_id, etc).
function uploadBufferToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // needed for non-image files like pdf/doc/docx
        folder: 'job-portal-cvs',
        public_id: `cv-${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = uploadBufferToCloudinary;