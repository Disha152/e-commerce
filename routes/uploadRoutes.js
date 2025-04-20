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
    console.log("Received files:", req.files);  // Log the received files to check if they exist

    if (!req.files || !req.files.attachments) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const files = Array.isArray(req.files.attachments)
      ? req.files.attachments
      : [req.files.attachments];

    const uploadedUrls = [];

    for (const file of files) {
      console.log("Uploading file:", file.tempFilePath);  // Log the file path for debugging

      // Upload the file to Cloudinary
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "auto",  // Cloudinary will determine file type automatically
        folder: "tasks_attachments",
      });

      console.log("Cloudinary upload result:", result);  // Log the result from Cloudinary

      uploadedUrls.push(result.secure_url);  // Add the file URL to the array
    }

    res.status(200).json({ urls: uploadedUrls });  // Send back the file URLs
  } catch (err) {
    console.error("Upload error:", err);  // Log any errors during the upload process
    res.status(500).json({ message: "Upload failed" });
  }
});

router.post('/new-tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).send(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
