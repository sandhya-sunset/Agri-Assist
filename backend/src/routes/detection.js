const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const Detection = require('../models/Detection');
const Recommendation = require('../models/Recommendation');
const { protect } = require('../middlewares/authMiddleware');
const { NodeFileSystem } = require('../utils/tfUtils');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

let model;
let classMapping;

async function loadModel() {
  try {
    const modelPath = path.join(__dirname, '../ml_model/model.json');
    model = await tf.loadLayersModel(new NodeFileSystem(modelPath));
    // Load class mapping correctly
    const mappingPath = path.join(__dirname, '../ml_model/class_mapping.json');
    const mappingData = require(mappingPath);
    classMapping = mappingData;
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
  }
}

loadModel();

async function preprocessImage(imagePath) {
  const imageBuffer = await sharp(imagePath)
    .resize(224, 224)
    .removeAlpha()
    .raw()
    .toBuffer();

  const tensor = tf.tensor3d(new Uint8Array(imageBuffer), [224, 224, 3]);
  const normalized = tensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
  const batched = normalized.expandDims(0);

  return batched;
}

router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const preprocessedImage = await preprocessImage(imagePath);

    const predictions = await model.predict(preprocessedImage).data();
    const predictedClassIndex = predictions.indexOf(Math.max(...predictions));
    const confidence = Math.max(...predictions) * 100;

    const diseaseName = classMapping[predictedClassIndex] || 'Unknown';

    const recommendations = await Recommendation.findOne({
      diseaseName: diseaseName
    });

    const detection = new Detection({
      userId: req.user.id,
      imagePath: imagePath,
      diseaseDetected: diseaseName,
      confidence: confidence,
      recommendations: recommendations ? [
        ...recommendations.fertilizers.map(f => ({ type: 'fertilizer', ...f })),
        ...recommendations.pesticides.map(p => ({ type: 'pesticide', ...p }))
      ] : []
    });

    await detection.save();

    const io = req.app.get('io');
    io.to(req.user.id).emit('detection-complete', {
      detectionId: detection._id,
      disease: diseaseName,
      confidence: confidence
    });

    res.json({
      success: true,
      data: {
        detectionId: detection._id,
        disease: diseaseName,
        confidence: confidence.toFixed(2),
        recommendations: recommendations || null,
        imagePath: imagePath
      }
    });

  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({ success: false, message: 'Error processing image', error: error.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const detections = await Detection.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: detections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      userId: req.user.id
    });


    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection not found' });
    }

    res.json({ success: true, data: detection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching detection' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const detection = await Detection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection not found or unauthorized' });
    }

    // Optional: Delete image file from storage if needed
    // const fs = require('fs');
    // if (detection.imagePath) {
    //   fs.unlink(detection.imagePath, (err) => {
    //     if (err) console.error('Error deleting image file:', err);
    //   });
    // }

    res.json({ success: true, message: 'Detection deleted successfully' });
  } catch (error) {
    console.error('Error deleting detection:', error);
    res.status(500).json({ success: false, message: 'Error deleting detection' });
  }
});

module.exports = router;