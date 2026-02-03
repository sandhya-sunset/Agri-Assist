const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');

class NodeFileSystem {
    constructor(path) {
        this.path = path;
    }

    async load() {
        const modelJsonPath = this.path;
        const dir = path.dirname(modelJsonPath);

        // Read model.json
        try {
            const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));

            // Extract topology and weights manifest
            const modelTopology = modelJson.modelTopology;
            const weightsManifest = modelJson.weightsManifest;

            if (!weightsManifest) {
                return { modelTopology };
            }

            // Load weights
            const weightSpecs = [];
            const weightData = [];

            for (const group of weightsManifest) {
                weightSpecs.push(...group.weights);

                for (const weightPath of group.paths) {
                    const fullPath = path.join(dir, weightPath);
                    const buffer = fs.readFileSync(fullPath);
                    weightData.push(new Uint8Array(buffer));
                }
            }

            // Concatenate all weight buffers into one
            const totalLength = weightData.reduce((acc, buf) => acc + buf.length, 0);
            const concatenatedWeights = new Uint8Array(totalLength);
            let offset = 0;

            for (const buf of weightData) {
                concatenatedWeights.set(buf, offset);
                offset += buf.length;
            }

            return {
                modelTopology,
                weightSpecs,
                weightData: concatenatedWeights.buffer
            };
        } catch (error) {
            console.error('Error loading model from disk:', error);
            throw error;
        }
    }
}

module.exports = { NodeFileSystem };
