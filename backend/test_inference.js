const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const path = require('path');
const { NodeFileSystem } = require('./src/utils/tfUtils');

async function run() {
    const modelPath = path.join(__dirname, 'src/ml_model/model.json');
    const model = await tf.loadLayersModel(new NodeFileSystem(modelPath));
    const mappingData = require(path.join(__dirname, 'src/ml_model/class_mapping.json'));

    // Create random noise image
    const tensor = tf.randomNormal([224, 224, 3]);
    const batched = tensor.toFloat().div(tf.scalar(255)).expandDims(0);

    let predictions = await model.predict(batched).data();
    let maxVal = Math.max(...predictions);
    let predictedClassIndex = predictions.indexOf(maxVal);

    console.log("Random noise predicted Class:", mappingData[predictedClassIndex], maxVal);

    // Try a solid color
    const solidTensor = tf.ones([224, 224, 3]).mul(128);
    const batchedSolid = solidTensor.toFloat().div(tf.scalar(255)).expandDims(0);
    predictions = await model.predict(batchedSolid).data();
    maxVal = Math.max(...predictions);
    predictedClassIndex = predictions.indexOf(maxVal);

    console.log("Solid color predicted Class:", mappingData[predictedClassIndex], maxVal);
}

run().catch(console.error);
