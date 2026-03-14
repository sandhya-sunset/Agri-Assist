require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello! Are you working?");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();