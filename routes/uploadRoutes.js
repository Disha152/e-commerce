const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.attachments) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const files = Array.isArray(req.files.attachments)
      ? req.files.attachments
      : [req.files.attachments];

    const uploadedUrls = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "auto",
        folder: "tasks_attachments"
      });
      uploadedUrls.push(result.secure_url);
    }

    res.status(200).json({ urls: uploadedUrls });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
