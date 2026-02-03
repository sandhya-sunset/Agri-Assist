const mongoose = require('mongoose');
const Recommendation = require('./models/Recommendation');
require('dotenv').config();

const recommendations = [
  {
    diseaseName: "Apple___Apple_scab",
    plantType: "Apple",
    description: "Fungal disease caused by Venturia inaequalis affecting leaves and fruits",
    symptoms: ["Olive-green to brown spots on leaves", "Scabby lesions on fruit", "Premature leaf drop"],
    fertilizers: [
      {
        name: "Calcium Nitrate",
        description: "Improves cell wall strength and disease resistance",
        dosage: "1 tablespoon per gallon of water",
        applicationMethod: "Soil drench every 2 weeks",
        price: 18.99
      }
    ],
    pesticides: [
      {
        name: "Myclobutanil Fungicide",
        description: "Systemic fungicide effective against apple scab",
        dosage: "1-2 teaspoons per gallon",
        applicationMethod: "Foliar spray at first sign of disease",
        price: 29.99
      }
    ],
    treatments: [
      {
        name: "Disease Management",
        steps: [
          "Remove and destroy infected leaves",
          "Apply fungicide at bud break",
          "Maintain good air circulation",
          "Rake and dispose of fallen leaves"
        ]
      }
    ],
    preventionTips: [
      "Choose resistant varieties",
      "Prune trees for better air flow",
      "Remove fallen leaves in autumn",
      "Apply preventive fungicide sprays"
    ]
  },
  {
    diseaseName: "Apple___Black_rot",
    plantType: "Apple",
    description: "Fungal disease caused by Botryosphaeria obtusa affecting fruit and leaves",
    symptoms: ["Brown circular lesions on fruit", "Leaf spots with purple margins", "Fruit mummification"],
    fertilizers: [
      {
        name: "Balanced NPK 10-10-10",
        description: "Maintains overall plant health and vigor",
        dosage: "2 pounds per tree base",
        applicationMethod: "Apply around drip line quarterly",
        price: 22.99
      }
    ],
    pesticides: [
      {
        name: "Captan Fungicide",
        description: "Broad spectrum fungicide for black rot control",
        dosage: "2 tablespoons per gallon",
        applicationMethod: "Spray every 7-10 days during wet periods",
        price: 31.99
      }
    ],
    treatments: [
      {
        name: "Immediate Control",
        steps: [
          "Prune out infected branches",
          "Remove mummified fruits",
          "Apply fungicide treatment",
          "Improve tree nutrition"
        ]
      }
    ],
    preventionTips: [
      "Remove infected fruit and wood",
      "Maintain tree vigor with proper fertilization",
      "Prune for good air circulation",
      "Apply dormant season sprays"
    ]
  },
  {
    diseaseName: "Apple___Cedar_apple_rust",
    plantType: "Apple",
    description: "Fungal disease requiring both apple and cedar trees to complete lifecycle",
    symptoms: ["Orange spots on upper leaf surface", "Yellow lesions on fruit", "Premature defoliation"],
    fertilizers: [
      {
        name: "Potassium Sulfate",
        description: "Enhances disease resistance in apple trees",
        dosage: "1.5 tablespoons per gallon",
        applicationMethod: "Foliar spray monthly during growing season",
        price: 19.99
      }
    ],
    pesticides: [
      {
        name: "Propiconazole Fungicide",
        description: "Systemic fungicide effective against rust diseases",
        dosage: "1 teaspoon per gallon",
        applicationMethod: "Apply at pink bud stage and repeat",
        price: 36.99
      }
    ],
    treatments: [
      {
        name: "Rust Management",
        steps: [
          "Remove nearby cedar trees if possible",
          "Apply fungicide at bud break",
          "Monitor and treat early symptoms",
          "Maintain tree health"
        ]
      }
    ],
    preventionTips: [
      "Plant resistant apple varieties",
      "Remove cedar trees within 1 mile radius",
      "Apply preventive fungicides",
      "Ensure proper tree spacing"
    ]
  },
  {
    diseaseName: "Apple___healthy",
    plantType: "Apple",
    description: "Healthy apple leaves with no disease symptoms",
    symptoms: ["Green uniform color", "No spots or lesions", "Normal growth pattern"],
    fertilizers: [
      {
        name: "Organic Compost",
        description: "Maintains soil health and provides slow-release nutrients",
        dosage: "2-3 inches mulch layer",
        applicationMethod: "Apply around tree base annually",
        price: 15.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Maintenance Care",
        steps: [
          "Regular watering schedule",
          "Annual pruning for shape",
          "Monitor for early disease signs",
          "Maintain soil nutrition"
        ]
      }
    ],
    preventionTips: [
      "Continue regular monitoring",
      "Maintain proper irrigation",
      "Annual soil testing",
      "Preventive fungicide if needed"
    ]
  },
  {
    diseaseName: "Blueberry___healthy",
    plantType: "Blueberry",
    description: "Healthy blueberry plant with vigorous growth",
    symptoms: ["Dark green leaves", "No discoloration", "Strong growth"],
    fertilizers: [
      {
        name: "Acidic Fertilizer 4-3-4",
        description: "Specially formulated for acid-loving plants",
        dosage: "1 cup per bush",
        applicationMethod: "Apply in early spring and mid-summer",
        price: 24.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Regular Maintenance",
        steps: [
          "Maintain soil pH 4.5-5.5",
          "Mulch with pine needles",
          "Prune old wood annually",
          "Consistent watering"
        ]
      }
    ],
    preventionTips: [
      "Test and adjust soil pH regularly",
      "Use acidic mulch",
      "Ensure good drainage",
      "Monitor for pests and diseases"
    ]
  },
  {
    diseaseName: "Cherry_(including_sour)___Powdery_mildew",
    plantType: "Cherry",
    description: "Fungal disease causing white powdery coating on leaves",
    symptoms: ["White powdery spots on leaves", "Leaf curling", "Stunted growth"],
    fertilizers: [
      {
        name: "Potassium Bicarbonate",
        description: "Natural fungicide and plant strengthener",
        dosage: "1 tablespoon per quart water",
        applicationMethod: "Spray weekly on affected areas",
        price: 16.99
      }
    ],
    pesticides: [
      {
        name: "Sulfur Fungicide",
        description: "Organic option for powdery mildew control",
        dosage: "3 tablespoons per gallon",
        applicationMethod: "Spray every 7-14 days",
        price: 21.99
      }
    ],
    treatments: [
      {
        name: "Mildew Control",
        steps: [
          "Remove heavily infected leaves",
          "Improve air circulation",
          "Apply fungicide treatment",
          "Reduce overhead watering"
        ]
      }
    ],
    preventionTips: [
      "Plant in sunny locations",
      "Ensure proper spacing",
      "Prune for air flow",
      "Water at base of plant"
    ]
  },
  {
    diseaseName: "Cherry_(including_sour)___healthy",
    plantType: "Cherry",
    description: "Healthy cherry tree with no disease symptoms",
    symptoms: ["Vibrant green foliage", "No fungal growth", "Normal fruit development"],
    fertilizers: [
      {
        name: "Fruit Tree Fertilizer 5-10-10",
        description: "Promotes healthy fruiting and growth",
        dosage: "1-2 pounds per inch of trunk diameter",
        applicationMethod: "Apply in early spring",
        price: 27.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Preventive Care",
        steps: [
          "Annual dormant oil spray",
          "Regular pruning",
          "Monitor tree health",
          "Maintain soil fertility"
        ]
      }
    ],
    preventionTips: [
      "Regular inspection for pests",
      "Proper watering schedule",
      "Annual fertilization",
      "Prune dead or diseased wood"
    ]
  },
  {
    diseaseName: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    plantType: "Corn",
    description: "Fungal disease causing gray leaf spots on corn",
    symptoms: ["Small gray spots on leaves", "Rectangular lesions", "Reduced photosynthesis"],
    fertilizers: [
      {
        name: "Nitrogen Fertilizer 46-0-0",
        description: "Promotes vigorous growth and recovery",
        dosage: "1 cup per 10 feet of row",
        applicationMethod: "Side-dress when plants are knee-high",
        price: 19.99
      }
    ],
    pesticides: [
      {
        name: "Azoxystrobin Fungicide",
        description: "Effective against cercospora leaf spot",
        dosage: "6-12 fl oz per acre",
        applicationMethod: "Apply at first sign of disease",
        price: 42.99
      }
    ],
    treatments: [
      {
        name: "Disease Management",
        steps: [
          "Remove infected lower leaves",
          "Apply fungicide treatment",
          "Ensure proper plant spacing",
          "Rotate crops annually"
        ]
      }
    ],
    preventionTips: [
      "Plant resistant hybrids",
      "Practice crop rotation",
      "Remove crop residue",
      "Avoid overhead irrigation"
    ]
  },
  {
    diseaseName: "Corn_(maize)___Common_rust_",
    plantType: "Corn",
    description: "Fungal disease producing rust-colored pustules on leaves",
    symptoms: ["Reddish-brown pustules on leaves", "Yellowing of leaves", "Reduced yield"],
    fertilizers: [
      {
        name: "Balanced NPK 20-20-20",
        description: "Maintains plant vigor during infection",
        dosage: "1 tablespoon per gallon water",
        applicationMethod: "Foliar spray bi-weekly",
        price: 23.99
      }
    ],
    pesticides: [
      {
        name: "Triazole Fungicide",
        description: "Systemic control of rust diseases",
        dosage: "As per label instructions",
        applicationMethod: "Apply when pustules first appear",
        price: 38.99
      }
    ],
    treatments: [
      {
        name: "Rust Control",
        steps: [
          "Apply fungicide at early symptoms",
          "Monitor weather conditions",
          "Maintain plant nutrition",
          "Remove severely infected plants"
        ]
      }
    ],
    preventionTips: [
      "Choose rust-resistant varieties",
      "Plant early in season",
      "Avoid late planting",
      "Monitor regularly during humid weather"
    ]
  },
  {
    diseaseName: "Corn_(maize)___Northern_Leaf_Blight",
    plantType: "Corn",
    description: "Fungal disease causing long gray-green lesions on leaves",
    symptoms: ["Long cigar-shaped lesions", "Gray-green to tan color", "Leaf tissue death"],
    fertilizers: [
      {
        name: "Potassium Chloride",
        description: "Strengthens cell walls against infection",
        dosage: "100-150 lbs per acre",
        applicationMethod: "Broadcast before planting",
        price: 28.99
      }
    ],
    pesticides: [
      {
        name: "Pyraclostrobin Fungicide",
        description: "Broad spectrum fungicide for leaf diseases",
        dosage: "4-8 fl oz per acre",
        applicationMethod: "Apply at tasseling stage",
        price: 45.99
      }
    ],
    treatments: [
      {
        name: "Blight Management",
        steps: [
          "Apply fungicide preventively",
          "Plant resistant hybrids",
          "Manage crop residue",
          "Ensure adequate plant nutrition"
        ]
      }
    ],
    preventionTips: [
      "Use resistant varieties",
      "Rotate crops for 2-3 years",
      "Bury crop residue",
      "Maintain balanced fertilization"
    ]
  },
  {
    diseaseName: "Corn_(maize)___healthy",
    plantType: "Corn",
    description: "Healthy corn plant with normal growth",
    symptoms: ["Dark green leaves", "Straight stalks", "Normal ear development"],
    fertilizers: [
      {
        name: "Corn Starter Fertilizer 10-34-0",
        description: "Promotes early root and shoot development",
        dosage: "100 lbs per acre",
        applicationMethod: "Apply at planting in furrow",
        price: 32.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Optimal Care",
        steps: [
          "Regular soil testing",
          "Adequate irrigation",
          "Weed control",
          "Monitor for pests and diseases"
        ]
      }
    ],
    preventionTips: [
      "Plant certified seed",
      "Practice crop rotation",
      "Maintain soil fertility",
      "Scout fields regularly"
    ]
  },
  {
    diseaseName: "Grape___Black_rot",
    plantType: "Grape",
    description: "Fungal disease affecting grapes, caused by Guignardia bidwellii",
    symptoms: ["Brown circular spots on leaves", "Black mummified berries", "Fruit rot"],
    fertilizers: [
      {
        name: "Calcium Sulfate",
        description: "Improves disease resistance in grapes",
        dosage: "2 lbs per vine",
        applicationMethod: "Apply to soil in early spring",
        price: 17.99
      }
    ],
    pesticides: [
      {
        name: "Mancozeb Fungicide",
        description: "Protective fungicide for black rot",
        dosage: "2-3 lbs per acre",
        applicationMethod: "Spray from bud break through harvest",
        price: 34.99
      }
    ],
    treatments: [
      {
        name: "Disease Control",
        steps: [
          "Remove and destroy infected fruit",
          "Prune for air circulation",
          "Apply fungicide regularly",
          "Sanitize pruning tools"
        ]
      }
    ],
    preventionTips: [
      "Prune vines properly",
      "Remove mummies from vines",
      "Apply dormant sprays",
      "Ensure good air flow"
    ]
  },
  {
    diseaseName: "Grape___Esca_(Black_Measles)",
    plantType: "Grape",
    description: "Complex fungal disease affecting grape vines",
    symptoms: ["Tiger stripe pattern on leaves", "Berry spotting", "Vine decline"],
    fertilizers: [
      {
        name: "Organic Seaweed Extract",
        description: "Enhances vine immunity and stress tolerance",
        dosage: "2-4 oz per gallon",
        applicationMethod: "Foliar spray monthly",
        price: 25.99
      }
    ],
    pesticides: [
      {
        name: "Copper Hydroxide",
        description: "Reduces fungal infections in vines",
        dosage: "1-2 lbs per acre",
        applicationMethod: "Apply during dormant season",
        price: 29.99
      }
    ],
    treatments: [
      {
        name: "Vine Management",
        steps: [
          "Remove infected wood during pruning",
          "Avoid vine stress",
          "Maintain proper irrigation",
          "Apply wound protectants"
        ]
      }
    ],
    preventionTips: [
      "Use clean pruning cuts",
      "Avoid over-cropping",
      "Maintain vine vigor",
      "Remove infected vines"
    ]
  },
  {
    diseaseName: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    plantType: "Grape",
    description: "Fungal disease causing leaf spots and defoliation",
    symptoms: ["Brown angular spots on leaves", "Premature leaf drop", "Reduced photosynthesis"],
    fertilizers: [
      {
        name: "Magnesium Sulfate",
        description: "Prevents leaf yellowing and improves health",
        dosage: "1 tablespoon per gallon",
        applicationMethod: "Foliar spray every 2 weeks",
        price: 14.99
      }
    ],
    pesticides: [
      {
        name: "Chlorothalonil Fungicide",
        description: "Broad spectrum protection against leaf diseases",
        dosage: "1.5-2 pints per acre",
        applicationMethod: "Apply every 7-14 days",
        price: 39.99
      }
    ],
    treatments: [
      {
        name: "Leaf Disease Control",
        steps: [
          "Remove infected leaves",
          "Apply protective fungicide",
          "Improve canopy air flow",
          "Maintain vine nutrition"
        ]
      }
    ],
    preventionTips: [
      "Prune for good air circulation",
      "Avoid overhead irrigation",
      "Remove leaf debris",
      "Apply preventive sprays"
    ]
  },
  {
    diseaseName: "Grape___healthy",
    plantType: "Grape",
    description: "Healthy grape vine with vigorous growth",
    symptoms: ["Lush green foliage", "Healthy fruit clusters", "Strong vine growth"],
    fertilizers: [
      {
        name: "Grape Complete Fertilizer 5-10-15",
        description: "Balanced nutrition for optimal grape production",
        dosage: "1-2 lbs per vine",
        applicationMethod: "Apply in early spring",
        price: 26.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Preventive Maintenance",
        steps: [
          "Annual pruning",
          "Regular monitoring",
          "Soil testing",
          "Proper irrigation"
        ]
      }
    ],
    preventionTips: [
      "Maintain proper vine training",
      "Regular soil amendments",
      "Adequate water management",
      "Pest and disease monitoring"
    ]
  },
  {
    diseaseName: "Orange___Haunglongbing_(Citrus_greening)",
    plantType: "Orange",
    description: "Bacterial disease transmitted by Asian citrus psyllid",
    symptoms: ["Yellowing of leaves", "Blotchy mottling", "Misshapen bitter fruit"],
    fertilizers: [
      {
        name: "Citrus Nutritional Spray",
        description: "Micronutrient blend for diseased citrus",
        dosage: "2-3 oz per gallon",
        applicationMethod: "Foliar spray monthly",
        price: 31.99
      }
    ],
    pesticides: [
      {
        name: "Systemic Insecticide for Psyllids",
        description: "Controls vector insects",
        dosage: "As per label",
        applicationMethod: "Soil drench or trunk injection",
        price: 48.99
      }
    ],
    treatments: [
      {
        name: "Disease Management",
        steps: [
          "Remove infected trees immediately",
          "Control psyllid populations",
          "Provide enhanced nutrition",
          "Use certified disease-free nursery stock"
        ]
      }
    ],
    preventionTips: [
      "Plant only certified clean nursery stock",
      "Control psyllid vectors",
      "Remove infected trees promptly",
      "Monitor trees regularly"
    ]
  },
  {
    diseaseName: "Peach___Bacterial_spot",
    plantType: "Peach",
    description: "Bacterial disease affecting leaves and fruit",
    symptoms: ["Small dark spots on leaves", "Fruit lesions", "Premature leaf drop"],
    fertilizers: [
      {
        name: "Calcium Nitrate",
        description: "Strengthens cell walls against bacterial invasion",
        dosage: "1 lb per inch trunk diameter",
        applicationMethod: "Apply as foliar spray",
        price: 19.99
      }
    ],
    pesticides: [
      {
        name: "Copper Bactericide",
        description: "Controls bacterial spot in stone fruits",
        dosage: "2-4 lbs per acre",
        applicationMethod: "Spray before bud break and throughout season",
        price: 35.99
      }
    ],
    treatments: [
      {
        name: "Bacterial Control",
        steps: [
          "Apply copper sprays dormant season",
          "Remove infected plant material",
          "Avoid overhead irrigation",
          "Prune for better air circulation"
        ]
      }
    ],
    preventionTips: [
      "Plant resistant varieties",
      "Apply copper during dormancy",
      "Maintain tree vigor",
      "Avoid working in wet conditions"
    ]
  },
  {
    diseaseName: "Peach___healthy",
    plantType: "Peach",
    description: "Healthy peach tree with no disease symptoms",
    symptoms: ["Green vibrant leaves", "Healthy fruit set", "Normal growth"],
    fertilizers: [
      {
        name: "Peach Tree Fertilizer 10-10-10",
        description: "Complete nutrition for peach trees",
        dosage: "1 lb per year of tree age up to 10 lbs",
        applicationMethod: "Broadcast around drip line",
        price: 24.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Regular Care",
        steps: [
          "Annual pruning in late winter",
          "Thin fruit for better quality",
          "Regular watering",
          "Monitor for pests"
        ]
      }
    ],
    preventionTips: [
      "Proper spacing between trees",
      "Annual dormant sprays",
      "Balanced fertilization",
      "Good sanitation practices"
    ]
  },
  {
    diseaseName: "Pepper,_bell___Bacterial_spot",
    plantType: "Pepper",
    description: "Bacterial disease affecting pepper plants",
    symptoms: ["Small raised spots on leaves", "Fruit lesions", "Leaf yellowing and drop"],
    fertilizers: [
      {
        name: "Calcium Chloride",
        description: "Improves cell wall integrity",
        dosage: "1-2 tablespoons per gallon",
        applicationMethod: "Foliar spray weekly",
        price: 15.99
      }
    ],
    pesticides: [
      {
        name: "Copper Hydroxide Bactericide",
        description: "Controls bacterial spot on peppers",
        dosage: "1-2 lbs per acre",
        applicationMethod: "Spray every 7-10 days",
        price: 28.99
      }
    ],
    treatments: [
      {
        name: "Disease Management",
        steps: [
          "Remove heavily infected plants",
          "Apply copper-based bactericide",
          "Avoid overhead watering",
          "Sanitize tools between plants"
        ]
      }
    ],
    preventionTips: [
      "Use disease-free seed or transplants",
      "Rotate crops for 3 years",
      "Avoid working with wet plants",
      "Improve air circulation"
    ]
  },
  {
    diseaseName: "Pepper,_bell___healthy",
    plantType: "Pepper",
    description: "Healthy pepper plant with normal development",
    symptoms: ["Dark green leaves", "Healthy fruit development", "Vigorous growth"],
    fertilizers: [
      {
        name: "Pepper & Tomato Fertilizer 5-10-10",
        description: "Promotes fruiting and plant health",
        dosage: "2 tablespoons per plant every 2 weeks",
        applicationMethod: "Side-dress around plant base",
        price: 18.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Optimal Growth",
        steps: [
          "Regular watering",
          "Mulch to retain moisture",
          "Support plants if needed",
          "Monitor for pests"
        ]
      }
    ],
    preventionTips: [
      "Maintain consistent moisture",
      "Fertilize regularly",
      "Provide adequate sunlight",
      "Good garden hygiene"
    ]
  },
  {
    diseaseName: "Potato___Early_blight",
    plantType: "Potato",
    description: "Fungal disease causing concentric ring spots on leaves",
    symptoms: ["Brown spots with concentric rings", "Lower leaves affected first", "Reduced yield"],
    fertilizers: [
      {
        name: "Potassium Phosphate",
        description: "Enhances disease resistance",
        dosage: "2 tablespoons per gallon",
        applicationMethod: "Foliar spray every 2 weeks",
        price: 22.99
      }
    ],
    pesticides: [
      {
        name: "Chlorothalonil Fungicide",
        description: "Effective control of early blight",
        dosage: "1.5-2 pints per acre",
        applicationMethod: "Apply at first disease symptoms",
        price: 37.99
      }
    ],
    treatments: [
      {
        name: "Blight Control",
        steps: [
          "Remove infected lower leaves",
          "Apply fungicide regularly",
          "Mulch to prevent soil splash",
          "Maintain proper plant spacing"
        ]
      }
    ],
    preventionTips: [
      "Use certified disease-free seed potatoes",
      "Rotate crops for 3-4 years",
      "Avoid overhead irrigation",
      "Remove volunteer potatoes"
    ]
  },
  {
    diseaseName: "Potato___Late_blight",
    plantType: "Potato",
    description: "Devastating fungal-like disease of potatoes",
    symptoms: ["Dark brown to black lesions on leaves", "White fungal growth", "Tuber rot"],
    fertilizers: [
      {
        name: "Potassium Sulfate",
        description: "Strengthens plant defenses",
        dosage: "1.5 lbs per 100 sq ft",
        applicationMethod: "Broadcast before planting",
        price: 26.99
      }
    ],
    pesticides: [
      {
        name: "Mancozeb + Metalaxyl",
        description: "Systemic and contact fungicide for late blight",
        dosage: "2 lbs per acre",
        applicationMethod: "Apply preventively every 5-7 days",
        price: 44.99
      }
    ],
    treatments: [
      {
        name: "Emergency Response",
        steps: [
          "Destroy infected plants immediately",
          "Apply systemic fungicide",
          "Hill soil around plants",
          "Harvest tubers when tops die"
        ]
      }
    ],
    preventionTips: [
      "Plant resistant varieties",
      "Ensure good air circulation",
      "Monitor weather for disease-favorable conditions",
      "Apply preventive fungicides"
    ]
  },
  {
    diseaseName: "Potato___healthy",
    plantType: "Potato",
    description: "Healthy potato plant with vigorous growth",
    symptoms: ["Lush green foliage", "Strong stems", "Normal tuber development"],
    fertilizers: [
      {
        name: "Potato Fertilizer 8-24-24",
        description: "Formulated for optimal tuber production",
        dosage: "1000-1500 lbs per acre",
        applicationMethod: "Broadcast and incorporate before planting",
        price: 33.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Best Practices",
        steps: [
          "Hill plants when 6-8 inches tall",
          "Consistent moisture management",
          "Monitor for Colorado potato beetles",
          "Side-dress with nitrogen at flowering"
        ]
      }
    ],
    preventionTips: [
      "Use certified seed potatoes",
      "Practice crop rotation",
      "Maintain soil pH 5.0-6.0",
      "Regular scouting for pests and diseases"
    ]
  },
  {
    diseaseName: "Raspberry___healthy",
    plantType: "Raspberry",
    description: "Healthy raspberry canes with good vigor",
    symptoms: ["Green leaves", "Healthy canes", "Good fruit production"],
    fertilizers: [
      {
        name: "Berry Fertilizer 10-5-5",
        description: "Nitrogen-focused for cane growth",
        dosage: "1-2 lbs per 100 sq ft",
        applicationMethod: "Apply in early spring",
        price: 21.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Cane Management",
        steps: [
          "Prune out old canes after harvest",
          "Thin new canes to 4-6 per foot",
          "Mulch with organic matter",
          "Maintain consistent moisture"
        ]
      }
    ],
    preventionTips: [
      "Good air circulation between rows",
      "Remove fruiting canes after harvest",
      "Monitor for cane diseases",
      "Proper weed control"
    ]
  },
  {
    diseaseName: "Soybean___healthy",
    plantType: "Soybean",
    description: "Healthy soybean plants with optimal growth",
    symptoms: ["Dark green trifoliate leaves", "Vigorous growth", "Good pod set"],
    fertilizers: [
      {
        name: "Starter Fertilizer 10-20-20",
        description: "Promotes early growth and nodulation",
        dosage: "100-150 lbs per acre",
        applicationMethod: "Apply at planting",
        price: 29.99
      }
    ],
    pesticides: [],
    treatments: [
      {
        name: "Optimal Management",
        steps: [
          "Inoculate seed before planting",
          "Scout for pests weekly",
          "Ensure adequate soil moisture",
          "Monitor nutrient status"
        ]
      }
    ],
    preventionTips: [
      "Plant certified seed",
      "Practice crop rotation",
      "Control weeds early",
      "Maintain soil fertility"
    ]
  },
  {
    diseaseName: "Squash___Powdery_mildew",
    plantType: "Squash",
    description: "Common fungal disease affecting cucurbit crops",
    symptoms: ["White powdery coating on leaves", "Leaf yellowing", "Reduced fruit quality"],
    fertilizers: [
      {
        name: "Potassium Bicarbonate",
        description: "Natural fungicide and pH adjuster",
        dosage: "1 tablespoon per quart water",
        applicationMethod: "Spray weekly on leaves",
        price: 16.99
      }
    ],
    pesticides: [
      {
        name: "Sulfur Dust",
        description: "Organic powdery mildew control",
        dosage: "Dust liberally on affected plants",
        applicationMethod: "Apply early morning or evening",
        price: 19.99
      }
    ],
    treatments: [
      {
        name: "Mildew Management",
        steps: [
"Remove heavily infected leaves",
"Apply sulfur or potassium bicarbonate",
"Ensure good air circulation",
"Water at base of plants"
]
}
],
preventionTips: [
"Plant resistant varieties",
"Provide adequate spacing",
"Avoid overhead watering",
"Remove infected plant debris"
]
},
{
    diseaseName: "Strawberry___Leaf_scorch",
plantType: "Strawberry",
description: "Fungal disease causing leaf spotting and browning",
symptoms: ["Purple to brown spots on leaves", "Leaf margins turn brown", "Reduced plant vigor"],
fertilizers: [
{
name: "Strawberry Fertilizer 10-10-10",
description: "Balanced nutrition for berry plants",
dosage: "1 lb per 25 feet of row",
applicationMethod: "Band application in early spring",
price: 17.99
}
],
pesticides: [
{
name: "Captan Fungicide",
description: "Controls leaf diseases in strawberries",
dosage: "2 tablespoons per gallon",
applicationMethod: "Spray at first sign of disease",
price: 25.99
}
],
treatments: [
{
name: "Leaf Disease Control",
steps: [
"Remove infected leaves",
"Apply fungicide treatment",
"Improve plant spacing",
"Renovate planting after harvest"
]
}
],
preventionTips: [
"Use disease-free plants",
"Avoid wetting foliage",
"Renovate beds after harvest",
"Remove old leaves in spring"
]
},
{
    diseaseName: "Strawberry___healthy",
plantType: "Strawberry",
description: "Healthy strawberry plants with good production",
symptoms: ["Bright green leaves", "Strong runners", "Abundant fruit"],
fertilizers: [
{
name: "Berry Boost 5-10-5",
description: "Promotes flowering and fruiting",
dosage: "1/2 cup per plant",
applicationMethod: "Side-dress in early spring",
price: 20.99
}
],
pesticides: [],
treatments: [
{
name: "Seasonal Care",
steps: [
"Remove runners if not propagating",
"Mulch with straw in winter",
"Renovate planting after harvest",
"Regular watering during fruiting"
]
}
],
preventionTips: [
"Plant in well-drained soil",
"Mulch to prevent fruit rot",
"Remove old leaves in spring",
"Control weeds regularly"
]
},
{
    diseaseName: "Tomato___Bacterial_spot",
plantType: "Tomato",
description: "Bacterial disease affecting leaves and fruit",
symptoms: ["Small dark spots on leaves", "Fruit lesions with white halos", "Leaf yellowing"],
fertilizers: [
{
name: "Calcium Nitrate",
description: "Strengthens cell walls",
dosage: "1 tablespoon per gallon",
applicationMethod: "Foliar spray bi-weekly",
price: 18.99
}
],
pesticides: [
{
name: "Copper Fungicide + Mancozeb",
description: "Combination bactericide for tomatoes",
dosage: "2 tablespoons per gallon",
applicationMethod: "Spray every 7-10 days",
price: 32.99
}
],
treatments: [
{
name: "Bacterial Control",
steps: [
"Remove infected plant parts",
"Apply copper-based treatment",
"Stake plants for air flow",
"Avoid overhead watering"
]
}
],
preventionTips: [
"Use disease-free transplants",
"Rotate crops for 3 years",
"Sanitize tools and stakes",
"Avoid working with wet plants"
]
},
{
    diseaseName: "Tomato___Early_blight",
plantType: "Tomato",
description: "Fungal disease causing target-spot lesions",
symptoms: ["Concentric ring spots on lower leaves", "Stem lesions", "Fruit rot near stem"],
fertilizers: [
{
name: "Tomato Fertilizer 4-6-8",
description: "Promotes plant vigor and disease resistance",
dosage: "1 cup per plant every 3 weeks",
applicationMethod: "Side-dress around plant base",
price: 21.99
}
],
pesticides: [
{
name: "Chlorothalonil Fungicide",
description: "Broad spectrum fungicide for tomato diseases",
dosage: "1.5 tablespoons per gallon",
applicationMethod: "Spray every 7-14 days",
price: 36.99
}
],
treatments: [
{
name: "Early Blight Management",
steps: [
"Remove lower infected leaves",
"Mulch to prevent soil splash",
"Apply fungicide preventively",
"Maintain plant nutrition"
]
}
],
preventionTips: [
"Rotate tomatoes with non-solanaceous crops",
"Mulch plants heavily",
"Water at base of plants",
"Remove crop debris at end of season"
]
},
{
    diseaseName: "Tomato___Late_blight",
plantType: "Tomato",
description: "Devastating fungal-like disease affecting tomatoes",
symptoms: ["Large brown irregular lesions", "White fungal growth under leaves", "Fruit rot"],
fertilizers: [
{
name: "Potassium Phosphate",
description: "Strengthens plant immunity",
dosage: "2-3 tablespoons per gallon",
applicationMethod: "Foliar spray every 7-10 days",
price: 25.99
}
],
pesticides: [
{
name: "Copper Fungicide",
description: "Organic control for late blight",
dosage: "1-2 tablespoons per gallon",
applicationMethod: "Spray every 5-7 days",
price: 34.99
}
],
treatments: [
{
name: "Immediate Action",
steps: [
"Remove infected plants immediately",
"Improve air circulation",
"Avoid overhead watering",
"Apply copper-based fungicide"
]
}
],
preventionTips: [
"Plant resistant varieties",
"Ensure good air circulation",
"Water at base of plants",
"Monitor weather forecasts for blight alerts"
]
},
{
    diseaseName: "Tomato___Leaf_Mold",
plantType: "Tomato",
description: "Fungal disease thriving in humid greenhouse conditions",
symptoms: ["Yellow spots on upper leaf surface", "Olive-green mold on underside", "Leaf drop"],
fertilizers: [
{
name: "Balanced NPK 10-10-10",
description: "Maintains overall plant health",
dosage: "1 tablespoon per gallon",
applicationMethod: "Drench soil every 3 weeks",
price: 19.99
}
],
pesticides: [
{
name: "Chlorothalonil Fungicide",
description: "Controls leaf mold in tomatoes",
dosage: "1.5 tablespoons per gallon",
applicationMethod: "Spray every 7-10 days",
price: 33.99
}
],
treatments: [
{
name: "Mold Control",
steps: [
"Reduce humidity in greenhouse",
"Improve air circulation",
"Remove infected leaves",
"Apply fungicide treatment"
]
}
],
preventionTips: [
"Maintain humidity below 85%",
"Ensure adequate ventilation",
"Space plants properly",
"Avoid overhead watering"
]
},
{
    diseaseName: "Tomato___Septoria_leaf_spot",
plantType: "Tomato",
description: "Fungal disease causing numerous small leaf spots",
symptoms: ["Small circular spots with gray centers", "Black dots in spot centers", "Lower leaves affected first"],
fertilizers: [
{
name: "Fish Emulsion 5-1-1",
description: "Organic nitrogen source for recovery",
dosage: "2 tablespoons per gallon",
applicationMethod: "Foliar spray weekly",
price: 23.99
}
],
pesticides: [
{
name: "Mancozeb Fungicide",
description: "Protects against septoria leaf spot",
dosage: "2 tablespoons per gallon",
applicationMethod: "Spray every 7-10 days",
price: 29.99
}
],
treatments: [
{
name: "Leaf Spot Management",
steps: [
"Remove lower infected leaves",
"Mulch to prevent splash",
"Apply protective fungicide",
"Stake plants off ground"
]
}
],
preventionTips: [
"Rotate crops annually",
"Mulch heavily",
"Remove infected plant debris",
"Avoid wetting foliage"
]
},
{
    diseaseName: "Tomato___Spider_mites Two-spotted_spider_mite",
plantType: "Tomato",
description: "Arachnid pest causing stippling and webbing on plants",
symptoms: ["Fine webbing on leaves", "Yellow stippling on leaves", "Leaf bronzing"],
fertilizers: [
{
name: "Seaweed Extract",
description: "Helps plants recover from mite damage",
dosage: "2-3 oz per gallon",
applicationMethod: "Foliar spray weekly",
price: 24.99
}
],
pesticides: [
{
name: "Insecticidal Soap",
description: "Organic control for spider mites",
dosage: "5 tablespoons per gallon",
applicationMethod: "Spray undersides of leaves every 3 days",
price: 16.99
},
{
name: "Neem Oil",
description: "Natural miticide and insecticide",
dosage: "2 tablespoons per gallon",
applicationMethod: "Spray thoroughly every 7 days",
price: 22.99
}
],
treatments: [
{
name: "Mite Control",
steps: [
"Spray plants with strong water jet",
"Apply insecticidal soap",
"Introduce predatory mites",
"Remove heavily infested leaves"
]
}
],
preventionTips: [
"Maintain adequate soil moisture",
"Avoid over-fertilizing with nitrogen",
"Encourage beneficial insects",
"Monitor plants regularly"
]
},
{
    diseaseName: "Tomato___Target_Spot",
plantType: "Tomato",
description: "Fungal disease causing concentric ring spots",
symptoms: ["Brown spots with concentric rings", "Affects leaves, stems, and fruit", "Premature defoliation"],
fertilizers: [
{
name: "Potassium Sulfate",
description: "Enhances disease resistance",
dosage: "1.5 tablespoons per gallon",
applicationMethod: "Foliar spray every 2 weeks",
price: 20.99
}
],
pesticides: [
{
name: "Azoxystrobin Fungicide",
description: "Systemic fungicide for target spot",
dosage: "1 tablespoon per gallon",
applicationMethod: "Spray every 7-14 days",
price: 41.99
}
],
treatments: [
{
name: "Target Spot Control",
steps: [
"Remove infected plant parts",
"Apply systemic fungicide",
"Improve air circulation",
"Mulch to prevent soil splash"
]
}
],
preventionTips: [
"Use resistant varieties",
"Rotate crops for 2-3 years",
"Space plants adequately",
"Remove crop debris"
]
},
{
    diseaseName: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
plantType: "Tomato",
description: "Viral disease transmitted by whiteflies",
symptoms: ["Upward leaf curling", "Yellowing of leaves", "Stunted growth", "Poor fruit set"],
fertilizers: [
{
name: "Micronutrient Spray",
description: "Supports stressed plants",
dosage: "As per label",
applicationMethod: "Foliar application weekly",
price: 27.99
}
],
pesticides: [
{
name: "Systemic Insecticide for Whiteflies",
description: "Controls virus vector",
dosage: "As per label instructions",
applicationMethod: "Soil drench or spray",
price: 38.99
}
],
treatments: [
{
name: "Virus Management",
steps: [
"Remove infected plants immediately",
"Control whitefly populations",
"Use reflective mulches",
"Plant virus-resistant varieties"
]
}
],
preventionTips: [
"Use whitefly-resistant varieties",
"Install insect screening in greenhouses",
"Control whiteflies preventively",
"Remove infected plants promptly"
]
},
{
    diseaseName: "Tomato___Tomato_mosaic_virus",
plantType: "Tomato",
description: "Viral disease causing mottled leaf patterns",
symptoms: ["Light and dark green mottling on leaves", "Leaf distortion", "Reduced fruit quality"],
fertilizers: [
{
name: "Complete Micronutrient Mix",
description: "Helps maintain plant vigor",
dosage: "1 tablespoon per gallon",
applicationMethod: "Foliar spray bi-weekly",
price: 25.99
}
],
pesticides: [],
treatments: [
{
name: "Virus Control",
steps: [
"Remove and destroy infected plants",
"Sanitize tools after each use",
"Wash hands before handling plants",
"Control aphid vectors"
]
}
],
preventionTips: [
"Use resistant varieties",
"Avoid tobacco products near plants",
"Sanitize tools regularly",
"Buy certified disease-free transplants"
]
},
{
    diseaseName: "Tomato___healthy",
plantType: "Tomato",
description: "Healthy tomato plant with vigorous growth",
symptoms: ["Dark green foliage", "Strong stems", "Good fruit set"],
fertilizers: [
{
name: "Tomato Fertilizer 8-32-16",
description: "Balanced nutrition for fruit production",
dosage: "1/2 cup per plant every 3 weeks",
applicationMethod: "Side-dress and water in",
price: 22.99
}
],
pesticides: [],
treatments: [
{
name: "Optimal Care",
steps: [
"Water deeply and regularly",
"Mulch to conserve moisture",
"Stake or cage plants",
"Prune suckers on indeterminate varieties"
]
}
],
preventionTips: [
"Plant in full sun",
"Ensure good soil drainage",
"Maintain consistent watering",
"Monitor for pests and diseases early"
]
}
];
async function seedDatabase() {
try {
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');
await Recommendation.deleteMany({});
console.log('Cleared existing recommendations');

await Recommendation.insertMany(recommendations);
console.log(`Successfully seeded ${recommendations.length} recommendations`);

process.exit(0);
} catch (error) {
console.error('Seeding error:', error);
process.exit(1);
}
}
seedDatabase();

