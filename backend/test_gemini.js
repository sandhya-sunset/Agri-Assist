require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const models = await genAI.getGenerativeModel({model: "gemini-1.5-pro-latest"}).generateContent("Hi");
    console.log(models.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();