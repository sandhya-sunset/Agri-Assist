const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const path = require('path');
const { NodeFileSystem } = require('./src/utils/tfUtils');

async function run() {
    const modelPath = path.join(__dirname, 'src/ml_model/model.json');
    const model = await tf.loadLayersModel(new NodeFileSystem(modelPath));
    const mappingData = require(path.join(__dirname, 'src/ml_model/class_mapping.json'));

    // Create random noise image to see if it defaults to 24
    const tensor = tf.randomNormal([224, 224, 3]);
    const normalized = tensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
    const batched = normalized.expandDims(0);

    const predictions = await model.predict(batched).data();
    console.log("Predictions Array Type:");
    console.log(predictions.constructor.name);

    const maxVal = Math.max(...predictions);
    const predictedClassIndex = predictions.indexOf(maxVal);

    console.log("Predicted Index:", predictedClassIndex);

    // Convert to regular array
    const predictionsArr = Array.from(predictions);
    const maxValArr = Math.max(...predictionsArr);
    const predictedClassIndexArr = predictionsArr.indexOf(maxValArr);
    console.log("Converted array Predicted Index:", predictedClassIndexArr);
}

run().catch(console.error);
