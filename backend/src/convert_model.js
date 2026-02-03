const fs = require('fs');
const path = require('path');

const modelPath = path.join(__dirname, 'ml_model/model.json');

console.log(`Reading model from ${modelPath}`);

let modelData;
try {
    const rawData = fs.readFileSync(modelPath);
    modelData = JSON.parse(rawData);
} catch (error) {
    console.error("Error reading model.json:", error);
    process.exit(1);
}

// Helper to convert inputs
function convertInboundNodes(inboundNodes) {
    if (!Array.isArray(inboundNodes)) return inboundNodes;

    return inboundNodes.map(node => {
        // If it's already an array, leave it (Keras 2 style)
        if (Array.isArray(node)) return node;

        // Keras 3 style: { args: [...], kwargs: ... }
        if (node.args) {
            const inputs = [];
            
            // Helper to extract keras_history
            const extractHistory = (tensor) => {
                if (tensor.class_name === '__keras_tensor__' && tensor.config && tensor.config.keras_history) {
                    return tensor.config.keras_history;
                }
                return null;
            };

            // Check arguments
            node.args.forEach(arg => {
                // If arg is an array (like in Add layers: args=[ [t1, t2] ])
                if (Array.isArray(arg)) {
                    arg.forEach(subArg => {
                        const h = extractHistory(subArg);
                        if (h) inputs.push(h);
                    });
                } else {
                    const h = extractHistory(arg);
                    if (h) inputs.push(h);
                }
            });

            // Return array of inputs
            return inputs;
        }
        
        return node;
    });
}

if (modelData.modelTopology && modelData.modelTopology.model_config && modelData.modelTopology.model_config.config && modelData.modelTopology.model_config.config.layers) {
    console.log("Found Functional model config. Processing layers...");
    
    const layers = modelData.modelTopology.model_config.config.layers;
    
    layers.forEach(layer => {
        // 1. Fix InputLayer
        if (layer.class_name === 'InputLayer') {
            if (layer.config.batch_shape && !layer.config.batchInputShape) {
                console.log(`Fixing InputLayer ${layer.name}: adding batchInputShape`);
                layer.config.batchInputShape = layer.config.batch_shape;
                // Optional: remove batch_shape if strict, but keeping it usually harmless unless conflicting
                // layer.config.batch_shape = undefined; 
            }
        }

        // 2. Fix inbound_nodes
        if (layer.inbound_nodes) {
            // Check if it needs conversion
            const nodes = layer.inbound_nodes;
            if (nodes.length > 0 && !Array.isArray(nodes[0])) {
               console.log(`Converting inbound_nodes for layer ${layer.name}`);
               layer.inbound_nodes = convertInboundNodes(nodes);
            }
        }
    });

} else {
    console.error("Could not find layers in modelTopology. Check file structure.");
}

// Write back
try {
    fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2));
    console.log("Successfully patched model.json");
} catch (error) {
    console.error("Error writing model.json:", error);
}
