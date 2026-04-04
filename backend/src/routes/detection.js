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
const fs = require('fs');

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
    console.log('Local Offline Model loaded successfully');
  } catch (error) {
    console.error('Failure to load local model:', error);
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
  const batched = tensor.toFloat().div(tf.scalar(255)).expandDims(0);

  return batched;
}

function normalizeDiseaseKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function formatPlantType(diseaseName) {
  const rawPlantType = String(diseaseName || 'Plant')
    .split('___')[0]
    .replace(/[(),]/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return rawPlantType || 'Plant';
}

function buildFallbackRecommendations(diseaseName) {
  const plantType = formatPlantType(diseaseName);
  const isHealthy = String(diseaseName || '').toLowerCase().includes('healthy');
  const fertilizerName = isHealthy
    ? `${plantType} Balanced Fertilizer`
    : `${plantType} Recovery Fertilizer`;
  const fertilizerDescription = isHealthy
    ? `Supports steady ${plantType.toLowerCase()} growth and strong leaf color.`
    : `Helps stressed ${plantType.toLowerCase()} plants recover after disease pressure.`;
  const boosterDescription = isHealthy
    ? 'Organic seaweed and amino acid booster to strengthen roots, leaf shine, and stress tolerance.'
    : 'Natural seaweed-based plant booster to reduce transplant and disease stress while supporting new growth.';
  const pesticideName = isHealthy ? 'Neem Oil Preventive Spray' : 'Neem Oil Leaf Protection Spray';
  const pesticideDescription = isHealthy
    ? 'Nature-friendly preventive spray that helps discourage soft-bodied pests and surface fungal growth.'
    : 'Organic neem-based spray for early-stage pest and leaf disease management without harsh residues.';

  return {
    diseaseName,
    plantType,
    description: isHealthy
      ? `${plantType} leaves look healthy. Continue preventive care to keep the plant vigorous.`
      : `Detected signs on ${plantType.toLowerCase()} leaves. Start supportive feeding and gentle organic protection early.`,
    symptoms: isHealthy
      ? ['Healthy leaf color', 'No major lesions visible', 'Normal growth pattern']
      : ['Visible leaf stress or spotting', 'Monitor nearby leaves for spread', 'Remove heavily damaged foliage early'],
    fertilizers: [
      {
        name: fertilizerName,
        description: fertilizerDescription,
        dosage: 'Apply every 10-14 days at label rate',
        applicationMethod: 'Side-dress around the root zone and water well'
      }
    ],
    boosters: [
      {
        name: 'Seaweed Plant Booster',
        description: boosterDescription,
        dosage: '3-5 ml per liter of water',
        applicationMethod: 'Foliar spray or root drench every 10-14 days'
      }
    ],
    pesticides: [
      {
        name: pesticideName,
        description: pesticideDescription,
        dosage: '5 ml neem oil + 2 ml mild soap per liter of water',
        applicationMethod: 'Spray in the early morning or evening once every 7 days'
      }
    ],
    treatments: [
      {
        name: isHealthy ? 'Preventive Care' : 'Immediate Care',
        description: isHealthy
          ? 'Keep the plant healthy with balanced feeding and routine inspection.'
          : 'Reduce stress quickly and stop spread with sanitation plus supportive care.',
        steps: isHealthy
          ? [
              'Inspect leaves weekly for new spots or pests',
              'Water at the root zone instead of over leaves',
              'Maintain good airflow around the plant'
            ]
          : [
              'Remove the worst affected leaves first',
              'Avoid overhead watering for several days',
              'Apply the organic spray on both leaf surfaces'
            ]
      }
    ],
    preventionTips: [
      'Use clean tools and avoid handling wet leaves',
      'Water early in the day so foliage dries fast',
      'Feed lightly but consistently instead of over-fertilizing',
      'Check nearby plants for the same symptoms'
    ]
  };
}

function mergeRecommendations(recommendation, diseaseName) {
  const fallback = buildFallbackRecommendations(diseaseName);

  if (!recommendation) {
    return fallback;
  }

  return {
    diseaseName,
    plantType: recommendation.plantType || fallback.plantType,
    description: recommendation.description || fallback.description,
    symptoms: recommendation.symptoms?.length ? recommendation.symptoms : fallback.symptoms,
    fertilizers: recommendation.fertilizers?.length ? recommendation.fertilizers : fallback.fertilizers,
    boosters: recommendation.boosters?.length ? recommendation.boosters : fallback.boosters,
    pesticides: recommendation.pesticides?.length ? recommendation.pesticides : fallback.pesticides,
    treatments: recommendation.treatments?.length ? recommendation.treatments : fallback.treatments,
    preventionTips: recommendation.preventionTips?.length ? recommendation.preventionTips : fallback.preventionTips
  };
}

async function findRecommendationByDisease(diseaseName) {
  const exactMatch = await Recommendation.findOne({ diseaseName }).lean();

  if (exactMatch) {
    return exactMatch;
  }

  const normalizedDiseaseName = normalizeDiseaseKey(diseaseName);
  const recommendations = await Recommendation.find({}).lean();

  return recommendations.find((item) => normalizeDiseaseKey(item.diseaseName) === normalizedDiseaseName) || null;
}

router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const targetPlantType = req.body.plantType || '';
    let diseaseName = 'Unknown - Analysis Failed';
    let confidence = 0;
    let plantType = 'Unknown';

    if (model && classMapping) {
      try {
        const processedImage = await preprocessImage(imagePath);
        const predictions = await model.predict(processedImage).data();
        
        const allowedIndices = [];
        if (targetPlantType) {
            for (const [index, className] of Object.entries(classMapping)) {
                if (className.toLowerCase().includes(targetPlantType.toLowerCase())) {
                    allowedIndices.push(parseInt(index));
                }
            }
        }
        if (allowedIndices.length === 0) {
            // fallback if not provided or matched
            allowedIndices.push(...Array.from({length: Object.keys(classMapping).length}, (_, i) => i));
        }

        let maxVal = -1;
        let predictedClassIndex = -1;
        let sumAllowed = 0;

        for (let i = 0; i < predictions.length; i++) {
            if (allowedIndices.includes(i)) {
                sumAllowed += predictions[i];
                if (predictions[i] > maxVal) {
                    maxVal = predictions[i];
                    predictedClassIndex = i;
                }
            }
        }
        
        diseaseName = classMapping[predictedClassIndex];
        confidence = sumAllowed > 0 ? (maxVal / sumAllowed) * 100 : maxVal * 100;
        confidence = Math.min(confidence, 99.99); // Max out gracefully
        
        plantType = formatPlantType(diseaseName);
        console.log(`Model predicted: ${diseaseName} (${confidence}%)`);
      } catch (inferenceError) {
        console.error('Inference error:', inferenceError);
      }
    } else {
      console.error('Offline model is not loaded');
    }

    const recommendation = await findRecommendationByDisease(diseaseName);
    const recommendationData = mergeRecommendations(recommendation, diseaseName);
    // Use the plantType from Gemini if available
    if (plantType && plantType !== 'Unknown') {
      recommendationData.plantType = plantType;
    }

    const detection = new Detection({
      userId: req.user.id,
      imagePath: imagePath,
      diseaseDetected: diseaseName,
      confidence: confidence,
      plantType: recommendationData.plantType,
      recommendationDetails: recommendationData,
      recommendations: [
        ...recommendationData.fertilizers.map((item) => ({ type: 'fertilizer', ...item })),
        ...recommendationData.boosters.map((item) => ({ type: 'booster', ...item })),
        ...recommendationData.pesticides.map((item) => ({ type: 'pesticide', ...item })),
        ...recommendationData.treatments.map((item) => ({ type: 'treatment', ...item }))
      ]
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
        confidence: Number(confidence).toFixed(2),
        recommendations: recommendationData,
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