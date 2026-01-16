import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.warn("Missing GEMINI_API_KEY environment variable. AI features may not work.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
